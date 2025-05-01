# SetNetwork.py

from Variables import *
from MyFunctions import *
from Training import *


def set_train_val_test(train_data, test_data):
    train_data = train_data.to_numpy()
    test_data = test_data.to_numpy()   

    x_train = train_data[: , 1:8]
    y_train = train_data[: , 0]
        
    x_test = test_data[: , 1:8]
    y_test = test_data[: , 0]

    x_train, y_train = shuffle_unison(x_train, y_train)  
    y_train = one_hot_encoding(y_train)
    y_test = one_hot_encoding(y_test)

    print("Number of Training Epochs: \t", x_train.shape[0])
    print("Number of Testing Epochs: \t", x_test.shape[0])

    data_len = x_train.shape[0]
    x_val, y_val = (x_train[:data_len // validation_ratio], y_train[:data_len // validation_ratio])
    x_train, y_train = (x_train[data_len // validation_ratio:], y_train[data_len // validation_ratio:])


    x_main_train = x_train
    x_main_val = x_val

    x_train, x_val, x_test = normalize_data(x_train, x_val, x_test)

    return x_train, x_val, x_test, y_train, y_val, y_test