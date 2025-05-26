from Variables import *
from LoadData import *
from MyFunctions import *
from Activation import *
from Variables import *
from Layer import *
from NeuralNetwork import *
from Training import *
from SetNetwork import *
from Testing import *

import pickle

if __name__ == "__main__":
    x_train, x_val, x_test, y_train, y_val, y_test, x_main_train, x_main_val = load_data()
    train_acc, valid_acc, train_loss, valid_loss, best_model = train(x_train, y_train, x_val, y_val)

    config_dictionary = best_model
    with open('trained_network.pkl', 'wb') as config_dictionary_file:
        pickle.dump(config_dictionary, config_dictionary_file)
    
    output = {
        "model_path": "trained_network.pkl", 
        "train_accuracy": train_acc[-1],
        "validation_accuracy": valid_acc[-1],
        "train_loss": train_loss[-1],
        "validation_loss": valid_loss[-1]
    }
    print(json.dumps(output))
    