from Scoring import *
from Clustering import *
from Variables import *

import sys
import pickle

def cluster_csv(file_path, output_folder):
    data = pd.read_csv(file_path, skiprows=[1])
    
    clustered = cluster_my_data_df(data)

    output_path = os.path.join(output_folder, os.path.basename(file_path))
    clustered.to_csv(output_path, index=False)
    
    return output_path 

def score_csv(file_path, output_folder):
    data = pd.read_csv(file_path, skiprows=[1])
    
    scored = score_data_df(data, best_model, x_main_train, x_main_val)

    output_path = os.path.join(output_folder, os.path.basename(file_path))
    scored.to_csv(output_path, index=False)
    
    return output_path 

model_path = "temp/download/trained_network.pkl"
if not os.path.exists(model_path):
    model_path = "default_trained_network.pkl"

# Load pretrained model
with open(model_path, 'rb') as config_dictionary_file:
    best_model = pickle.load(config_dictionary_file)

x_main_train = pd.read_csv("train_data_for_training.csv").to_numpy()[:,1:]
x_main_val = pd.read_csv("valid_data_for_validation.csv").to_numpy()[:,1:]

if __name__ == "__main__":
    input_files = sys.argv[1:]  # Take input files as arguments
    scored_folder = "temp/scored"
    clustered_folder = "temp/clustered"

    # Ensure output folders exist
    os.makedirs(scored_folder, exist_ok=True)
    os.makedirs(clustered_folder, exist_ok=True)

    output_data = {"scored": {}, "clustered": {}}

    for file_path in input_files:
        file_name = os.path.basename(file_path)

        # Score the file
        scored_path = score_csv(file_path, scored_folder)
        output_data["scored"][file_name] = scored_path

        # Cluster the scored file
        clustered_path = cluster_csv(scored_path, clustered_folder)
        output_data["clustered"][file_name] = clustered_path

    # Print JSON of all output paths
    print(json.dumps(output_data))