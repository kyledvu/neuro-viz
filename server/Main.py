from LoadData import *
from MyFunctions import *
from Activation import *
from Variables import *
from Layer import *
from NeuralNetwork import *
from Training import *
from SetNetwork import *
from Testing import *
from Scoring import *
from clustering import *

import sys
import io
import json
import numpy as np
import pandas as pd
import math
import random
import pickle
# from sklearn.metrics import confusion_matrix
# import matplotlib.pyplot as plt

config_file = os.path.join(os.path.dirname(__file__), "config.json")

def load_settings():
    with open(config_file, "r") as f:
        return json.load(f)

settings = load_settings()

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

# Load pretrained model
with open('Trained_Network', 'rb') as config_dictionary_file:
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