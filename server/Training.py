# Train.py

from MyFunctions import *
from Activation import *
from Variables import *
from Layer import *
from NeuralNetwork import *

import numpy as np
import pickle
from matplotlib import pyplot as plt


def find_accuracy(predicted, target):
    return (np.argmax(predicted, axis=1) == np.argmax(target, axis=1)).mean()


def train(x_train, y_train, x_valid, y_valid):
    train_acc = []
    valid_acc = []
    train_loss = []
    valid_loss = []
    best_model = None

    num_bad_iterations = 0

    model = NeuralNetwork()

    for epoch in range(0, epochs):
        print(f'M = {epoch}')
        x_train, y_train = shuffle_unison(x_train, y_train)

        for j in range(0, len(x_train), batch_size):

            x_batch = x_train[j : j + batch_size]
            y_batch = y_train[j : j + batch_size]
                        
            model.forward(x_batch, y_batch)
            model.backward()
            model.update_weights()

        t_pred, t_loss = model.forward(x_train, y_train)
        t_acc = find_accuracy(t_pred, y_train)
        train_acc.append(t_acc)
        train_loss.append(t_loss)

        v_pred, v_loss = model.forward(x_valid, y_valid)
        v_acc = find_accuracy(v_pred, y_valid)
        valid_acc.append(v_acc)
        valid_loss.append(v_loss)

        # early stopping check
        if len(valid_loss) >= 2 and valid_loss[-1] > valid_loss[-2]:
            num_bad_iterations += 1
            if num_bad_iterations == early_stop_epoch and early_stop:
                break
        else:
            best_model = model
            num_bad_iterations = 0

    plt.plot(np.arange(len(train_loss)), train_loss, label='Training Loss')
    plt.plot(np.arange(len(valid_loss)), valid_loss, label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss (Cross-Entropy)')
    plt.title('Training & validation losses across epochs')
    plt.legend()
    plt.show()

    plt.plot(np.arange(len(train_acc)), train_acc, label='Training Acc')
    plt.plot(np.arange(len(valid_acc)), valid_acc, label='Validation Acc')
    plt.xlabel('Epoch')
    plt.ylabel('Acc')
    plt.title('Training & validation accuracies across epochs')
    plt.legend()
    plt.show()
    return train_acc, valid_acc, train_loss, valid_loss, best_model


