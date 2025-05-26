from Variables import *
from Testing import *
from Training import *

# import numpy as np
# from matplotlib import pyplot as plt

from sklearn.metrics import confusion_matrix
from scipy import stats
import pandas as pd
import glob
# from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression


def get_cluster_ready():
    df = pd.read_csv(clustered_data)
    df = df[['mouse_id', 'EEG_DFT_Z', 'Delta_Ratio_Z', 'Theta_Ratio_Z', 'Alpha_Ratio_Z', 'Sigma_Ratio_Z', 
             'Beta_Ratio_Z','cluster']]

    ai_1_data = df.loc[df['mouse_id'] == 'MouseAI1']
    ai_2_data = df.loc[df['mouse_id'] == 'MouseAI2']
    ai_5_data = df.loc[df['mouse_id'] == 'MouseAI5']
    mouse_5_data = df.loc[df['mouse_id'] == 'Mouse05']
    mouse_12_data = df.loc[df['mouse_id'] == 'Mouse12']
    mouse_16_data = df.loc[df['mouse_id'] == 'Mouse16']
    
    train_data = mouse_5_data
    train_data = pd.concat([mouse_12_data, mouse_16_data], ignore_index=True)
    train_data = train_data.to_numpy()

    x_train = train_data[:, 1:7].astype('float')
    y_train = train_data[:, 7].astype('int')
    
    test_data = ai_2_data
    test_data = test_data.to_numpy()


    x_test = test_data[:, 1:7].astype('float')
    y_test = test_data[:, 7].astype('int')

    
    clf = LogisticRegression(max_iter = 500)
    clf.fit(x_train, y_train)
    y_pred = clf.predict(x_test)
    test_accuracy = confusion_matrix(y_test, y_pred)
    
    return clf
  
def get_labels(x_class, clf):    
    x_class_PW = x_class.loc[x_class['rodent_sleep'] != 'S'].copy()
    x_class = x_class.loc[x_class['rodent_sleep'] == 'S'].copy()

    # Z-score normalization for x_class
    for col in ['Delta_raw', 'Theta_raw', 'Alpha_raw', 'Sigma_raw', 'Beta_raw', 'EEG_raw']:
        z_col = col.replace('_raw', '_DFT_z')
        x_class[z_col] = stats.zscore(x_class[col], ddof=1)

    # Z-score normalization for x_class_PW
    for col in ['Delta_raw', 'Theta_raw', 'Alpha_raw', 'Sigma_raw', 'Beta_raw', 'EEG_raw']:
        z_col = col.replace('_raw', '_DFT_z')
        x_class_PW[z_col] = stats.zscore(x_class_PW[col], ddof=1)

    # Select and organize columns for each DataFrame
    cols = [
        'idx', 'time_stamp', 'EMG_z', 'Delta_z', 'Theta_z', 'Alpha_z', 
        'Sigma_z', 'Beta_z', 'EEG_z', 'EEG_DFT_z', 'Delta_DFT_z', 
        'Theta_DFT_z', 'Alpha_DFT_z', 'Sigma_DFT_z', 'Beta_DFT_z', 
        'EEG_raw', 'EMG_raw', 'Delta_raw', 'Theta_raw', 'Alpha_raw', 
        'Sigma_raw', 'Beta_raw', 'ZT', 'total', 'rodent_sleep', 'Temp'
    ]
    
    x_class = x_class[cols]
    x_class_PW = x_class_PW[cols]

    # Convert to numpy array and predict labels
    x_class_arr = x_class.to_numpy()[:, 9:15]
    y_class_pred = clf.predict(x_class_arr)

    # Update 'rodent_sleep' predictions
    x_class['rodent_sleep'] = y_class_pred + 1

    # Combine both DataFrames
    x_class = pd.concat([x_class, x_class_PW], ignore_index=True)

    return x_class

def cluster_my_data():
    file_type = 'csv'
    seperator =','
    
    
    clf = get_cluster_ready()
    
    for f in glob.glob(clustering_input_folder + "/*." + file_type):
        cur_input = pd.read_csv(f)
        
        print(f)
        
        final_result = get_labels(cur_input, clf)
        final_result.to_csv(clustering_output_folder + f[len(clustering_input_folder):])

def cluster_my_data_df(data):
    file_type = 'csv'
    seperator =','
    
    clf = get_cluster_ready()
    
    final_result = get_labels(data, clf)
    return final_result
       
    