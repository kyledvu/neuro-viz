import json

with open("default_config.json", "r") as f:
    default_settings = json.load(f)
with open("config.json", "r") as f:
    user_settings = json.load(f)

settings = {**default_settings, **user_settings}

layer_specs = settings["layer_specs"]
activation_fun = settings["activation_fun"]
learning_rate = settings["learning_rate"]
batch_size = settings["batch_size"]
epochs = settings["epochs"]
early_stop = settings["early_stop"]
early_stop_epoch = settings["early_stop_epoch"]
L2_penalty = settings["L2_penalty"]
momentum = settings["momentum"]
momentum_gamma = settings["momentum_gamma"]

validation_ratio = settings["validation_ratio"] 

EMG_top_outlier = settings["EMG_top_outlier"]
wave_length_outlier_STD = settings["wave_length_outlier_STD"]
EEG_outlier_STD = settings["EEG_outlier_STD"]

training_dataset_samples = settings["training_dataset_samples"]

experiment_start_time = settings["experiment_start_time"]
ZT_frequency = settings["ZT_frequency"]

train_folder_name = settings["train_folder_name"]
test_folder_name = settings["test_folder_name"]

is_dft_included = settings["is_dft_included"]

clustered_data = settings["clustered_data"]

is_dft_exists = settings["is_dft_exists"]

# Currently not in use
scoring_input_folder = "mouseSF/"
scoring_input_folder_dft = "Does_Not_Exist"
scoring_output_folder = "output_alz/"
clustering_input_folder = "output_alz/"
clustering_output_folder = "output_alz/"
