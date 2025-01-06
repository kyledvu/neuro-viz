# NeuralNetwork.py

from MyFunctions import *
from Activation import *
from Variables import *
from Layer import *

import numpy as np


class NeuralNetwork:

    # Create the Neural Network using config.
    def __init__(self):
        self.layers = []  # all layers
        self.x = None  # input to forward
        self.y = None  # output vector of model
        self.targets = None  # targets in forward

        # Add layers specified by layer_specs.
        for i in range(len(layer_specs) - 1):
            self.layers.append(Layer(layer_specs[i], layer_specs[i + 1]))
            if i < len(layer_specs) - 2:
                self.layers.append(Activation(activation_fun))

          
    # Make NeuralNetwork callable
    def __call__(self, x, targets=None):
        return self.forward(x, targets)

    
    # Compute forward pass through all the layers in the network and return it
    # If targets are provided, return loss as well
    def forward(self, x, targets=None):
        self.targets = targets
        self.x = x
        cur_x = self.x

        # len(layers) should be odd
        for i in range(len(self.layers)):
            # unit layer
            if i % 2 == 0:
                a = self.layers[i].forward(cur_x)
            # activation layer
            else:
                cur_x = self.layers[i].forward(a)

        self.y = self.softmax(a)
        loss = None
        if targets is not None:
            loss = self.loss(self.y, targets)
        return self.y, loss


    # Implement backpropagation here
    # Call backward methods of individual layer's
    def backward(self):
        delta = self.targets - self.y

        for i in range(len(self.layers) - 1, -1, -1):
            # unit layer
            if i % 2:
                delta = self.layers[i].backward(delta)
            else:
                delta = self.layers[i].backward(delta)


    # Implement the softmax function here
    # Remember to take care of the overflow condition
    def softmax(self, x):
        max_x = np.max(x)
        return np.exp(x - max_x) / (np.sum(np.exp(x - max_x), axis=1) + 1e-8).reshape(-1, 1)


    # compute the categorical cross-entropy loss and return it
    def loss(self, logits, targets):
        return -np.sum(targets * np.log(logits + 1e-8)) / targets.shape[0]

        
    # Perform an iteration of gradient descent on the weights of the model.
    def update_weights(self):
        for i in range(0, len(self.layers), 2):
            self.layers[i].update_weights()