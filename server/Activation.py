#Activation.py

from MyFunctions import *

import numpy as np
# import pandas as pd
# import random 
# import math
# import glob
# import csv
# import seaborn as sns
# from matplotlib import pyplot as plt
# from scipy import stats


class Activation:

    # Initialize activation type and placeholders here
    def __init__(self, activation_type="sigmoid"):
        if activation_type not in ["sigmoid", "tanh", "ReLU"]:
            raise NotImplementedError("%s is not implemented." % (activation_type))

        self.activation_type = activation_type # Type of non-linear activation.
        self.x = None # Placeholder for input. This will be used for computing gradients.

        
    # This method allows your instances to be callable
    def __call__(self, a):
        return self.forward(a)

    
    # Compute the forward pass
    def forward(self, a):
        if self.activation_type == "sigmoid":
            return self.sigmoid(a)
        elif self.activation_type == "tanh":
            return self.tanh(a)
        elif self.activation_type == "ReLU":
            return self.ReLU(a)

        
    # Compute the backward pass   
    def backward(self, delta):
        if self.activation_type == "sigmoid":
            grad = self.grad_sigmoid()
        elif self.activation_type == "tanh":
            grad = self.grad_tanh()
        elif self.activation_type == "ReLU":
            grad = self.grad_ReLU()
        
        return grad * delta

    
    # Implement the sigmoid activation here
    def sigmoid(self, x):
        self.x = x
        x = np.array(x, dtype=np.float64)
        return 1 / (1 + 1e-8 + np.exp(-x))
    
    
    # Implement tanh here
    def tanh(self, x):
        self.x = x
        x = np.array(x, dtype=np.float64)
        return 0.5 * (1 + np.tanh(x))

        
    # Implement ReLU here
    def ReLU(self, x):
        self.x = x
        return np.maximum(0, x)

    
    # Compute the gradient for sigmoid here
    def grad_sigmoid(self):
        z = self.sigmoid(self.x)
        return z * (1 - z)

    
    # Compute the gradient for tanh here
    def grad_tanh(self):
        return 1 - np.tanh(self.x) ** 2

    
    # Compute the gradient for ReLU here
    def grad_ReLU(self):
        return np.where(self.x > 0, 1, 0)
