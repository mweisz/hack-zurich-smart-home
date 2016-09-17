import os
import time
import json


start_date = time.mktime((2016, 5, 12, 0,0,0,0,0,0)) / 60
end_date = time.mktime((2016, 5, 19, 23,59,0,0,0,0)) / 60
simulation_len = int(end_date - start_date)

data_dir = "txt"
state = {"contact": {}, "doorbell": {}} #"movement": {}, 

for dir_name in list(state.keys()):
    for instance_dir in os.listdir(os.path.join(data_dir, dir_name)):
        # Set to defaults
        state[dir_name][instance_dir] = [0] * simulation_len

        if not os.path.isdir(os.path.join(data_dir, dir_name, instance_dir)):
            # .DS_Store goddamit
            continue
        # For each instance
        print(dir_name, ":", instance_dir)
        for event_file in os.listdir(os.path.join(data_dir, dir_name, instance_dir)):
            if event_file == ".DS_Store":
                # DS_STORE
                continue
            full_event_file = os.path.join(data_dir, dir_name, instance_dir, event_file)
            prev_pos = 0
            if os.path.isfile(full_event_file):
                parsed_json = json.load(open(full_event_file, "r"))
                if parsed_json["sensorType"] == "kontakt" and parsed_json["eventType"] != "status":
                    continue
                parsed_date = time.mktime((int(parsed_json["timestamp"][0:4]), int(parsed_json["timestamp"][5:7]), 
                                           int(parsed_json["timestamp"][8:10]), 
                                           int(parsed_json["timestamp"][11:13]), int(parsed_json["timestamp"][14:16]),
                                           0,0,0,0)) / 60
                if parsed_date < start_date or parsed_date > end_date:
                    #print("b",end="")
                    # Finish processing the instance
                    continue
                #print(parsed_json)
                    
                new_pos = int(parsed_date - start_date)

                #print(parsed_json["eventData"])
                #print(int(float(parsed_json["eventData"])))
                state[dir_name][instance_dir][prev_pos:new_pos] = [int(float(parsed_json["eventData"]))] * (new_pos - prev_pos) 
                prev_pos = new_pos

print("Sums:")
for sensor in list(state.keys()):
    for instance in list(state[sensor].keys()):
        print(instance, ":", sum(state[sensor][instance]))

with open("js/state_timeline.json", "w") as json_timeline:
    json_timeline.write(json.dumps(state))
json_timeline.close()
print("Written to", "js/state_timeline.json")