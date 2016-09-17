import os
import time
import json
import copy


start_date = int(time.mktime((2016, 5, 12, 0,0,0,0,0,0)) / 60)
end_date = int(time.mktime((2016, 5, 19, 23,59,0,0,0,0)) / 60)
simulation_len = end_date - start_date

data_dir = "txt"
state = {"contact": {}}# ,  "doorbell": {},  "movement": {}} # "contact": {}, "doorbell": {},  #"movement": {}, 
state_raw = copy.deepcopy(state)

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

        state_raw[dir_name][instance_dir] = copy.deepcopy(state[dir_name][instance_dir])
        state_raw[dir_name][instance_dir][:first_val_pos] = [first_val] * first_val_pos


print("Sums:")
for sensor in list(state.keys()):
    for instance in list(state[sensor].keys()):
        print(instance, ":", sum(filter(None, state[sensor][instance])))

with open("js/state_timeline.json", "w") as json_timeline:
    json_timeline.write(json.dumps(state))
json_timeline.close()
print("Written to", "js/state_timeline.json")

with open("js/state_timeline_raw.json", "w") as json_timeline:
    json_timeline.write(json.dumps(state_raw))
json_timeline.close()
print("Written to", "js/state_timeline_raw.json")