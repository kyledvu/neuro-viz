from Variables import *

import random
import sys
import os
import json
import shutil

if __name__ == "__main__":
    input_files = sys.argv[1:]
    train_folder = train_folder_name
    test_folder = test_folder_name

    os.makedirs(train_folder, exist_ok=True)
    os.makedirs(test_folder, exist_ok=True)

    output_data = {"train_data": {}, "test_data": {}}

    random.shuffle(input_files)
    split_index = int(len(input_files) * 1/train_test_ratio)
    train_files = input_files[split_index:]
    test_files = input_files[:split_index]

    for file_path in train_files:
        file_name = os.path.basename(file_path)
        output_path = os.path.join(train_folder, file_name)
        shutil.copyfile(file_path, output_path)
        output_data["train_data"][file_name] = output_path

    for file_path in test_files:
        file_name = os.path.basename(file_path)
        output_path = os.path.join(test_folder, file_name)
        shutil.copyfile(file_path, output_path)
        output_data["test_data"][file_name] = output_path

    print(json.dumps(output_data))