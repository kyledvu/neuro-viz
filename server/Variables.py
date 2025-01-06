# Variables.py

layer_specs = [7, 50, 50, 3]
activation_fun = "sigmoid"
learning_rate = 0.00003
batch_size = 500
epochs = 400
early_stop = True
early_stop_epoch = 5
L2_penalty = 0.001
momentum = True
momentum_gamma = 0.85


training_testing_ratio = 5 #change the name to validation

EMG_top_outlier = 0.05
wave_length_outlier_STD = 4
EEG_outlier_STD = 2

training_dataset_samples = 50 * 100


experiment_start_time = 19
ZT_frequency = 2 #We're analyzing based on every 2 hours


train_folder_name = 'train_data/'
test_folder_name = 'test_data/'

is_dft_included = False

clustered_data = 'clustered_data.csv'


is_dft_exists = "False"

scoring_input_folder = 'mouseSF/'
scoring_input_folder_dft = 'Does_Not_Exist'
scoring_output_folder = 'output_alz/'
clustering_input_folder = scoring_output_folder
clustering_output_folder = 'final_result/'

