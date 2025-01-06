# Layer.py

from Variables import *

import numpy as np
import math


class Layer:

    # Define the architecture and create placeholder
    def __init__(self, in_units, out_units):
        np.random.seed(42)
        self.w = math.sqrt(2 / in_units) * np.random.randn(in_units, out_units)
        self.b = np.zeros((1, out_units))  # Create a placeholder for Bias
        self.x = None  # input to forward pass
        self.a = None  # output of forward pass

        self.d_x = None  # w.r.t
        self.d_w = None  # w.r.t
        self.d_b = None  # w.r.t
        self.weight_velocity = np.zeros(self.w.shape)
        self.bias_velocity = np.zeros(self.b.shape)

        
    # Make layer callable
    def __call__(self, x):
        return self.forward(x)

    
    # Compute the forward pass through the layer here.
    # Do not apply activation here.
    # Return self.a
    def forward(self, x):
        self.x = x
        self.a = x @ self.w + self.b 
        return self.a

    
    # Write the code for backward pass. This takes in gradient from its next layer as input,
    # computes gradient for its weights and the delta to pass to its previous layers.
    # Return self.d_x
    def backward(self, delta):
        self.d_w = self.x.T @ delta
        self.d_b = np.ones((1, self.x.shape[0])) @ delta
        self.d_x = delta @ self.w.T
        return self.d_x


    # Update the weights between layers using alpha as learning rate
    def update_weights(self):
        self.weight_velocity = momentum * momentum_gamma * self.weight_velocity + learning_rate * (self.d_w 
        - L2_penalty * self.w)
        self.w += self.weight_velocity
        self.bias_velocity = momentum * momentum_gamma * self.bias_velocity + learning_rate * (self.d_b 
        - L2_penalty * self.b)
        self.b += self.bias_velocity
