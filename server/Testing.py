# Testing.py

from Training import *

def get_test_result(model, x_test, y_test):
    pred, loss = model.forward(x_test, y_test)
    
    accuracy = find_accuracy(pred, y_test)
    return loss, accuracy, pred

def test(best_model, x_test, y_test):
    test_loss, test_acc, pred = get_test_result(best_model, x_test, y_test)

    print("Test Loss\t", test_loss)
    print("Test Accuracy\t", test_acc)
    print('\n')

    y_pred = np.zeros([y_test.shape[0], 3], dtype=int)

    for i in range(0, y_pred.shape[0]):
        if(pred[i][0] > pred[i][1] and pred[i][0] > pred[i][2]):
            y_pred[i][0] = 1
            y_pred[i][1] = 0
            y_pred[i][2] = 0
            
        if(pred[i][1] > pred[i][0] and pred[i][1] > pred[i][2]):
            y_pred[i][0] = 0
            y_pred[i][1] = 1
            y_pred[i][2] = 0
            
        if(pred[i][2] > pred[i][1] and pred[i][2] > pred[i][0]):
            y_pred[i][0] = 0
            y_pred[i][1] = 0
            y_pred[i][2] = 1

    
    confusion_matrix = np.zeros([3, 3], dtype=int)

    for i in range(0, y_pred.shape[0]):
        if(y_pred[i][0] == 1 and y_test[i][0] == 1):
            confusion_matrix[0][0] += 1
        if(y_pred[i][0] == 1 and y_test[i][1] == 1):
            confusion_matrix[0][1] += 1
        if(y_pred[i][0] == 1 and y_test[i][2] == 1):
            confusion_matrix[0][2] += 1
            
        if(y_pred[i][1] == 1 and y_test[i][0] == 1):
            confusion_matrix[1][0] += 1
        if(y_pred[i][1] == 1 and y_test[i][1] == 1):
            confusion_matrix[1][1] += 1
        if(y_pred[i][1] == 1 and y_test[i][2] == 1):
            confusion_matrix[1][2] += 1
            
        if(y_pred[i][2] == 1 and y_test[i][0] == 1):
            confusion_matrix[2][0] += 1
        if(y_pred[i][2] == 1 and y_test[i][1] == 1):
            confusion_matrix[2][1] += 1
        if(y_pred[i][2] == 1 and y_test[i][2] == 1):
            confusion_matrix[2][2] += 1
    
    print('confusion_matrix:')

    print(confusion_matrix)

    print("\n\neither spec of sens:")

    for i in range(0, 3):
        true_p = confusion_matrix[i][i]
        all_p = 0
        for j in range(0, 3):
            all_p += confusion_matrix[j][i]
        if i == 0:
            print("accuracy of rem:\t", true_p/all_p)
        if i == 1:
            print("accuracy of nrem:\t", true_p/all_p)
        if i == 2:
            print("accuracy of Wake:\t", true_p/all_p)
    

    print("\n\neither spec of sens:")

    for i in range(0, 3):
        true_p = confusion_matrix[i][i]
        all_p = 0
        for j in range(0, 3):
            all_p += confusion_matrix[i][j]
        if i == 0:
            print("accuracy of rem:\t", true_p/all_p)
        if i == 1:
            print("accuracy of nrem:\t", true_p/all_p)
        if i == 2:
            print("accuracy of Wake:\t", true_p/all_p)
    

    print('\n\nTotal accuracy')
    
    print((confusion_matrix[0][0] + confusion_matrix[1][1] + confusion_matrix[2][2]) / 
          (confusion_matrix[0][0] + confusion_matrix[0][1] + confusion_matrix[0][2] + 
           confusion_matrix[1][0] + confusion_matrix[1][1] + confusion_matrix[1][2] + 
           confusion_matrix[2][0] + confusion_matrix[2][1] + confusion_matrix[2][2]))

    return
    
