#LoadData.py

from Variables import *
from MyFunctions import *

# import numpy as np
import pandas as pd
# import random 
# import math
import glob
from scipy import stats

def clean_data(mouse_data):

    mouse_data = mouse_data.dropna()
    mouse_data = mouse_data.loc[mouse_data['Rodent Sleep'] != 'X']
    mouse_data = mouse_data.loc[mouse_data['Rodent Sleep'] != 'A']
    
    mouse_data['Delta_z'] = stats.zscore(mouse_data['Delta'], ddof=1)
    mouse_data['Theta_z'] = stats.zscore(mouse_data['Theta'], ddof=1)
    mouse_data['Alpha_z'] = stats.zscore(mouse_data['Alpha'], ddof=1)
    mouse_data['Sigma_z'] = stats.zscore(mouse_data['Sigma'], ddof=1)
    mouse_data['Beta_z'] = stats.zscore(mouse_data['Beta'], ddof=1)
    mouse_data['EMG_z'] = stats.zscore(mouse_data['EMG'], ddof=1)
    mouse_data['EEG_z'] = stats.zscore(mouse_data['EEG'], ddof=1)


    mouse_data = mouse_data[mouse_data.EMG < mouse_data.EMG.quantile(1 - EMG_top_outlier)]
    mouse_data = mouse_data.loc[mouse_data['Delta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Theta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Alpha'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Sigma'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Beta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['EEG'] < EEG_outlier_STD]
    
    mouse_data = mouse_data.sample(frac = 1)

    return mouse_data

def clean_data_raw(mouse_data):

    mouse_data = mouse_data.dropna()
    mouse_data = mouse_data.loc[mouse_data['Rodent Sleep'] != 'X']
    mouse_data = mouse_data.loc[mouse_data['Rodent Sleep'] != 'A']
    
    mouse_data['Delta_z'] = stats.zscore(mouse_data['Delta'], ddof=1)
    mouse_data['Theta_z'] = stats.zscore(mouse_data['Theta'], ddof=1)
    mouse_data['Alpha_z'] = stats.zscore(mouse_data['Alpha'], ddof=1)
    mouse_data['Sigma_z'] = stats.zscore(mouse_data['Sigma'], ddof=1)
    mouse_data['Beta_z'] = stats.zscore(mouse_data['Beta'], ddof=1)
    mouse_data['EMG_z'] = stats.zscore(mouse_data['EMG'], ddof=1)
    mouse_data['EEG_z'] = stats.zscore(mouse_data['EEG'], ddof=1)


    mouse_data = mouse_data[mouse_data.EMG < mouse_data.EMG.quantile(1 - EMG_top_outlier)]
    mouse_data = mouse_data.loc[mouse_data['Delta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Theta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Alpha'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Sigma'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Beta'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['EEG'] < EEG_outlier_STD]
    

    return mouse_data


def read_input():

    train_data = pd.DataFrame()
    for f in glob.glob(train_folder_name + "/*"):
        cur_input = pd.read_csv(f)
        clean_input = clean_data(cur_input)
        clean_input = clean_input[['Rodent Sleep', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z']]
        clean_input = clean_input.sample(training_dataset_samples)
        train_data = train_data.append(clean_input)

    test_data = pd.DataFrame()
    for f in glob.glob(test_folder_name + "/*"):
        cur_input = pd.read_csv(f)
        clean_input = clean_data(cur_input)
        clean_input = clean_input[['Rodent Sleep', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z']]
        clean_input = clean_input.sample(training_dataset_samples)
        test_data = test_data.append(clean_input)

        
    #Balance the REM data for training purposes
    rem_train = train_data.loc[train_data['Rodent Sleep'] == 'P'] 
    k = train_data.loc[train_data['Rodent Sleep'] == 'S'].count()[0] / train_data.loc[train_data['Rodent Sleep'] == 'P'].count()[0]
    for i in range(0, int(k)):
        train_data = train_data.append(rem_train)

    return train_data, test_data

# Don't filter out raw EEG values or shuffle
def read_input_raw():

    file_type = 'csv'
    seperator =','

    train_data = pd.DataFrame()
    for f in glob.glob(train_folder_name + "/*."+file_type):
        cur_input = pd.read_csv(f)
        clean_input = clean_data_raw(cur_input)
        # clean_input = clean_input[['Rodent Sleep', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z']]
        # clean_input = clean_input.sample(training_dataset_samples)
        train_data = train_data.append(clean_input)
            
    file_type = 'csv'
    seperator =','
    test_data = pd.DataFrame()

    for f in glob.glob(test_folder_name + "/*."+file_type):
        cur_input = pd.read_csv(f)
        clean_input = clean_data_raw(cur_input)
        # clean_input = clean_input[['Rodent Sleep', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z']]
        # clean_input = clean_input.sample(training_dataset_samples)
        test_data = test_data.append(clean_input)
        
    return train_data, test_data

def load_data():

    train_data, test_data = read_input()

    train_data = train_data.to_numpy()
    test_data = test_data.to_numpy() 

    x_train = train_data[: , 1:8]
    y_train = train_data[: , 0]

    x_test = test_data[: , 1:8]
    y_test = test_data[: , 0]

    x_train, y_train = shuffle_unison(x_train, y_train)  
    y_train = one_hot_encoding(y_train)
    y_test = one_hot_encoding(y_test)

    data_len = x_train.shape[0]
    x_val, y_val = (x_train[:data_len // validation_ratio], y_train[:data_len // validation_ratio])
    x_train, y_train = (x_train[data_len // validation_ratio:], y_train[data_len // validation_ratio:])


    x_main_train = x_train
    x_main_val = x_val

    x_train, x_val, x_test = normalize_data(x_train, x_val, x_test)

    return x_train, x_val, x_test, y_train, y_val, y_test, x_main_train, x_main_val