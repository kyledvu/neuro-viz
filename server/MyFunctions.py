#MyFunctions.py

import numpy as np
# import pandas as pd
# import random 
# import math
# from scipy import stats



def shuffle_unison(x, y):
    if len(x) != len(y):
        print('shuffle_unison() Length mismatch')
        quit()
    r = np.random.permutation(len(x))
    return x[r], y[r]



def one_hot_encoding(labels, num_classes=3):
    onehot = np.zeros((labels.shape[0], num_classes))

    for i, label in enumerate(labels):
        if(label == 'P'):
            onehot[i][0] = 1
        if(label == 'S'):
            onehot[i][1] = 1
        if(label == 'W'):
            onehot[i][2] = 1
    return onehot


def normalize_data(x_train, x_val, x_test):

    x_train = np.array(x_train, dtype=np.float64)
    mean = x_train.mean(axis = 0)
    stdev = np.std(x_train, axis = 0)
        
    return ( x_train - mean / stdev,
             x_val - mean / stdev,
             x_test - mean / stdev )