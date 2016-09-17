import os
import time
import json
import datetime
import csv
import pickle

reparse = True

start_date = int(time.mktime((2016, 5, 12, 0,0,0,0,0,0)) / 60)
end_date = int(time.mktime((2016, 5, 18, 23,59,0,0,0,0)) / 60)
simulation_len = end_date - start_date + 1

data_dir = "txt"
state = {"contact": {}, "movement": {}}# ,  "doorbell": {},  } # "contact": {}, "doorbell": {},  #"movement": {},
#state_raw = copy.deepcopy(state)

if not reparse:
    state = pickle.load(open("state.p", "rb"))
else:
    for dir_name in list(state.keys()):
        for instance_dir in os.listdir(os.path.join(data_dir, dir_name)):
            # Set to defaults
            # Uncomment in AI implementation stage to know when there is no more data
            state[dir_name][instance_dir] = [None] * simulation_len
            #state[dir_name][instance_dir] = [0] * simulation_len

            if not os.path.isdir(os.path.join(data_dir, dir_name, instance_dir)):
                # .DS_Store goddamit
                continue
            smallest_future_date = time.mktime((2026, 5, 19, 23,59,0,0,0,0)) / 60 # Well that can't happen
            prev_pos = 0
            next_val = 0
            # For each instance
            print(dir_name, ":", instance_dir)
            print("Loading events")
            for event_file in os.listdir(os.path.join(data_dir, dir_name, instance_dir)):
                if event_file == ".DS_Store":
                    # DS_STORE
                    continue
                full_event_file = os.path.join(data_dir, dir_name, instance_dir, event_file)

                if os.path.isfile(full_event_file):
                    parsed_json = json.load(open(full_event_file, "r"))
                    if parsed_json["sensorType"] == "kontakt" and parsed_json["eventType"] != "status":
                        continue
                    parsed_date = int(time.mktime((int(parsed_json["timestamp"][0:4]), int(parsed_json["timestamp"][5:7]),
                                                   int(parsed_json["timestamp"][8:10]),
                                                   int(parsed_json["timestamp"][11:13]), int(parsed_json["timestamp"][14:16]),
                                                   0,0,0,0)) / 60)
                    #print(parsed_date)

                    if parsed_date < start_date or parsed_date > end_date:
                        if parsed_date > end_date and parsed_date < smallest_future_date:
                            next_val = int(float(parsed_json["eventData"]))
                            smallest_future_date = parsed_date
                        continue

                    #print(parsed_date, start_date, parsed_date - start_date, simulation_len)
                    state[dir_name][instance_dir][parsed_date - start_date] = int(float(parsed_json["eventData"]))
            # Fill intervals between events
            print("Filling the intervals between events")
            i = 0
            prev_pos = 0
            prev_val = None
            first_val = None
            for val in state[dir_name][instance_dir]:
                if val is not None:
                    if first_val is None:
                        first_val = val
                        first_val_pos = i
                    state[dir_name][instance_dir][prev_pos:i] = [prev_val] * (i - prev_pos)
                    prev_pos = i
                    prev_val = val
                i = i + 1
            state[dir_name][instance_dir][prev_pos:] = [next_val] * (len(state[dir_name][instance_dir]) - prev_pos)

    pickle.dump(state, open("state.p", "wb"))

print("Sums:")
for sensor in list(state.keys()):
    for instance in list(state[sensor].keys()):
        print(instance, ":", sum(filter(None, state[sensor][instance])))

# Add additional features
state.update({"extra_features":
                  {"workday": [0] * simulation_len,
                   "morning": [0] * simulation_len,
                   "evening": [0] * simulation_len}})
current_datetime = start_date * 60
for i in range(simulation_len):
    current_datetime = current_datetime + 1
    if datetime.datetime.fromtimestamp(current_datetime).isoweekday() in range(1, 6):
        state["extra_features"]["workday"][i] = 1
    if datetime.datetime.fromtimestamp(current_datetime).time() < datetime.time(12):
        state["extra_features"]["morning"][i] = 1
    if datetime.datetime.fromtimestamp(current_datetime).time() >= datetime.time(18):
        state["extra_features"]["evening"][i] = 1

# JSON (minutes)
with open("js/state_timeline.json", "w") as json_timeline:
    json_timeline.write(json.dumps(state))
json_timeline.close()
print("Written to", "js/state_timeline.json")

# Preprocessing for ML
state_prep = {}
for instance in list(state["contact"].keys()):
    state_prep[instance + "_freq"] = [0] * int(simulation_len / 60 + 1)
    changes = 0
    j = 0
    for i in range(simulation_len - 1):
        if state["contact"][instance][i] != state["contact"][instance][i+1]:
            changes = changes + 1
        if i % 60 == 0:
            state_prep[instance + "_freq"][j] = changes
            changes = 0
            j = j + 1

print(state_prep)

# CSV (in hours)
my_dict = {"test": 1, "testing": 2}
with open("csv/state_timeline.csv", "w") as csv_timeline:
    w = csv.writer(csv_timeline)
    row = []
    # These two arrays are for preserving the column order (array.keys() elements are in random order)
    sensor_keys = []
    instance_keys = []
    for sensor in list(state.keys()):
        sensor_keys.append(sensor)
        instance_keys.append([])
        for instance in list(state[sensor].keys()):
            row.append(instance)
            instance_keys[-1].append(instance)
    print(row)
    w.writerow(row)

    for i in range(simulation_len):
        row = []
        sensor_i = 0
        for sensor in sensor_keys:
            for instance in instance_keys[sensor_i]:
                row.append(str(state[sensor][instance][i]))
            sensor_i = sensor_i + 1

        w.writerow(row)
print("Written to", "csv/state_timeline.csv")
