# Scoring.py

import os

from Variables import *
from Testing import *
from Training import *

from scipy import stats
import numpy as np
import pandas as pd
import glob
# from matplotlib import pyplot as plt

def clean_for_scoring(mouse_data):
    
    mouse_data = mouse_data.rename(columns={"Unnamed: 0": "idx"}) # change this to set the order properly 
    
    if 'idx' not in mouse_data.columns:
        mouse_data['idx'] = range(1, len(mouse_data)+1)
    
    mouse_data = mouse_data.dropna()

    mouse_data['time_stamp'] = mouse_data['Time Stamp']
    mouse_data['Delta_raw'] = mouse_data['Delta']
    mouse_data['Theta_raw'] = mouse_data['Theta']
    mouse_data['Alpha_raw'] = mouse_data['Alpha']
    mouse_data['Sigma_raw'] = mouse_data['Sigma']
    mouse_data['Beta_raw'] = mouse_data['Beta']
    mouse_data['EMG_raw'] = mouse_data['EMG']
    mouse_data['EEG_raw'] = mouse_data['EEG']
    #print(mouse_data['Delta'])
    mouse_data['Delta_z'] = stats.zscore(mouse_data['Delta'], ddof=1)
    mouse_data['Theta_z'] = stats.zscore(mouse_data['Theta'], ddof=1)
    mouse_data['Alpha_z'] = stats.zscore(mouse_data['Alpha'], ddof=1)
    mouse_data['Sigma_z'] = stats.zscore(mouse_data['Sigma'], ddof=1)
    mouse_data['Beta_z'] = stats.zscore(mouse_data['Beta'], ddof=1)
    mouse_data['EMG_z'] = stats.zscore(mouse_data['EMG'], ddof=1)
    mouse_data['EEG_z'] = stats.zscore(mouse_data['EEG'], ddof=1)


    mouse_data = mouse_data[mouse_data.EMG < mouse_data.EMG.quantile(1 - EMG_top_outlier)]
    mouse_data = mouse_data.loc[mouse_data['Delta_z'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Theta_z'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Alpha_z'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Sigma_z'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['Beta_z'] < wave_length_outlier_STD]
    mouse_data = mouse_data.loc[mouse_data['EEG_z'] < EEG_outlier_STD]

    mouse_data = mouse_data.sample(frac = 1)
    
    #need temp column
    # mouse_data['Temp'] = np.nan
    if is_dft_included == True:
        mouse_data = mouse_data[['idx', 'time_stamp', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z',
                                 'Delta_DFT', 'Theta_DFT', 'Alpha_DFT', 'Sigma_DFT', 'Beta_DFT', 'EEG_DFT',
                                 'EMG_raw', 'Delta_raw', 'Theta_raw', 'Alpha_raw', 'Sigma_raw', 'Beta_raw', 'EEG_raw',
                                 'Temp']]
        
    else:
        mouse_data = mouse_data[['idx', 'time_stamp', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 'Sigma_z', 'Beta_z', 'EEG_z',
                                 'EMG_raw', 'Delta_raw', 'Theta_raw', 'Alpha_raw', 'Sigma_raw', 'Beta_raw', 'EEG_raw',
                                 'Temp']]
    
    return mouse_data




def get_scored(clean_input, best_model, x_main_train, x_main_val):
    saved_data = clean_input
    
    clean_input = clean_input.to_numpy()   
    
    x_score = clean_input[: , 2:9]
    y_score = np.asarray(['W'] * clean_input.shape[0])

    x_train, x_val, x_score = normalize_data(x_main_train, x_main_val, x_score)
    y_score = one_hot_encoding(y_score)
    score_loss, score_acc, pred = get_test_result(best_model, x_score, y_score)


    rs = ['a'] * x_score.shape[0]

    for i in range(0, pred.shape[0]):    
        if(pred[i][0] > pred[i][1] and pred[i][0] > pred[i][2]):
            rs[i] = 'P'
            
        if(pred[i][1] > pred[i][0] and pred[i][1] > pred[i][2]):
            rs[i] = 'S'
            
        if(pred[i][2] > pred[i][1] and pred[i][2] > pred[i][0]):
            rs[i] = 'W'

    saved_data['rodent_sleep'] = rs

    scored_data = saved_data 

    scored_data['time_stamp']= pd.to_datetime(scored_data['time_stamp'])

    # scored_data['ZT'] = (((scored_data.time_stamp.dt.hour + 5) // 2)) %12
    scored_data['ZT'] = (((scored_data.time_stamp.dt.hour + (24 - experiment_start_time)) // ZT_frequency)) % (24 / ZT_frequency) * ZT_frequency

    scored_data['total'] = 0
    Epoch_counter_general = scored_data.groupby(['ZT']).rodent_sleep.value_counts()
    Epoch_counter_general = Epoch_counter_general.unstack().fillna(value=0)
    Epoch_counter_general['Total'] = Epoch_counter_general.P + Epoch_counter_general.W + Epoch_counter_general.S
                
    for i in range(0, 12):
        if i in Epoch_counter_general.Total:
            scored_data.loc[scored_data.ZT == i, 'total'] = Epoch_counter_general['Total'][i]
        else:
                i+= 1

    return scored_data

# Delete unnecessary columns and rename old column names to new column names
def clean_cols(df):
    # Safely drop columns that exist in the DataFrame
    columns_to_remove = [
        'Delta', 
        'Theta', 
        'Alpha', 
        'Theta Ratio',
        'Activity (Mean; 10s)',
        # 'EEG (total; 0.5-25Hz ; 10s)', 
    ]

    # Drop columns only if they exist
    df.drop(columns=[col for col in columns_to_remove if col in df.columns], inplace=True)

    # Safely rename columns
    column_rename_mapping = {
        'Time Stamp': 'Time Stamp',
        'EMG (RMS; 10s)': 'EMG',
        'EEG (Delta; 0.5-4Hz)/(total; 0.5-25Hz)); 10s)': 'Delta',
        'EEG (Theta; 4-8Hz)/(total; 0.5-25Hz)); 10s)': 'Theta',
        'EEG (Alpha; 8-12Hz)/(total; 0.5-25Hz)); 10s)': 'Alpha',
        'EEG (Sigma; 12-16Hz)/(total; 0.5-25Hz)); 10s)': 'Sigma',
        'EEG (Beta; 16-24Hz)/(total; 0.5-25Hz)); 10s)': 'Beta',
        'EEG (total; 0.5-25Hz ; 10s)': 'EEG',
        'Temperature 2 (Mean; 10s)': 'Temp',
    }

    # Create a safe rename dictionary, only keeping keys that exist in the DataFrame
    safe_column_rename_mapping = {k: v for k, v in column_rename_mapping.items() if k in df.columns}

    # Rename columns
    df.rename(columns=safe_column_rename_mapping, inplace=True)
       
    unnamed_cols = [col for col in df.columns if 'Unnamed' in col]
    df.drop(columns=unnamed_cols, inplace=True)
    return df

def score_data(best_model, x_main_train, x_main_val):
    file_type = 'csv'
    seperator =','

    train_data = pd.DataFrame()
    for f in glob.glob(scoring_input_folder + "/*."+file_type):
        print(f)
        if 'dft' in f:
            continue
        cur_input = pd.read_csv(f, skiprows=[1])
        
        cur_input = clean_cols(cur_input)

        if is_dft_included == True:
            cur_dft_input = pd.read_csv(f[:len(f) - (len(file_type) + 1)] + "-dft." + file_type)

            cur_input['EEG_DFT'] = cur_dft_input['EEG_DFT']
            cur_input['Delta_DFT'] = cur_dft_input['Delta_DFT']
            cur_input['Theta_DFT'] = cur_dft_input['Theta_DFT']
            cur_input['Alpha_DFT'] = cur_dft_input['Alpha_DFT']
            cur_input['Sigma_DFT'] = cur_dft_input['Sigma_DFT']
            cur_input['Beta_DFT'] = cur_dft_input['Beta_DFT']
        
        clean_input = clean_for_scoring(cur_input)
        output_file = scoring_output_folder + f[len(scoring_input_folder):]

        scored_data = get_scored(clean_input, best_model, x_main_train, x_main_val)
        scored_data.to_csv(output_file)

# dft functionality removed?     
def score_data_df(data, best_model, x_main_train, x_main_val):
    file_type = 'csv'
    seperator =','
    
    cur_input = clean_cols(data)
    
    clean_input = clean_for_scoring(cur_input)

    scored_data = get_scored(clean_input, best_model, x_main_train, x_main_val)
    return scored_data

        
        

