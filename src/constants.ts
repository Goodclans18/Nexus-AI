export const PYTHON_SCRIPTS = {
  PREP: `
# Nexus AI - Step 1: Preparation
# Run this to install all necessary libraries

import os
import subprocess

def install_dependencies():
    packages = [
        'opencv-python',
        'mss',
        'pydirectinput',
        'keyboard',
        'torch',
        'torchvision',
        'numpy'
    ]
    
    print("Iniciando instalação do Arsenal de IA...")
    for package in packages:
        print(f"Instalando {package}...")
        subprocess.check_call(["pip", "install", package])
    print("Arsenal pronto!")

if __name__ == "__main__":
    install_dependencies()
`,
  COLLECT: `
# Nexus AI - Step 2: Data Collection
# This script records your gameplay

import mss
import keyboard
import cv2
import numpy as np
import time
import os

# Configurações do SSF2 (Ajustar coordenadas da janela)
MONITOR = {"top": 100, "left": 100, "width": 800, "height": 600}
DATA_DIR = "collected_data"

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def record_session():
    with mss.mss() as sct:
        count = 0
        print("Pressione 'T' para iniciar a coleta. 'Q' para parar.")
        keyboard.wait('t')
        
        while not keyboard.is_pressed('q'):
            # Captura Tela
            img = np.array(sct.grab(MONITOR))
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            
            # Captura Teclas (Exemplo)
            keys = []
            if keyboard.is_pressed('up'): keys.append('UP')
            if keyboard.is_pressed('right'): keys.append('RIGHT')
            if keyboard.is_pressed('p'): keys.append('ATTACK')
            
            # Salva par [Imagem] -> [Keys]
            # (Simplificado: salvando imagem com nome das teclas)
            filename = f"{DATA_DIR}/frame_{count}_{'_'.join(keys)}.jpg"
            cv2.imwrite(filename, img)
            
            count += 1
            time.sleep(0.03) # ~30 FPS

record_session()
`,
  BRAIN: `
# Nexus AI - Step 3: Neural Network Architecture
import torch
import torch.nn as nn
import torch.nn.functional as F

class NexusNet(nn.Module):
    def __init__(self, num_actions=8):
        super(NexusNet, self).__init__()
        # Entrada: Frames do jogo (Redimensionados)
        self.conv1 = nn.Conv2d(3, 32, kernel_size=8, stride=4)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=4, stride=2)
        self.conv3 = nn.Conv2d(64, 64, kernel_size=3, stride=1)
        
        self.fc1 = nn.Linear(64 * 7 * 7, 512)
        self.fc2 = nn.Linear(512, num_actions)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x)) # Probabilidade para cada tecla
`,
  TRAIN: `
# Nexus AI - Step 4: Training Loop
import torch.optim as optim

def train_model(model, dataloader):
    criterion = nn.BCELoss() # Binary Cross Entropy para múltiplas labels
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    model.train()
    for epoch in range(10):
        running_loss = 0.0
        for inputs, labels in dataloader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        print(f"Epoch {epoch+1} Loss: {running_loss/len(dataloader)}")
`,
  EXEC: `
# Nexus AI - Step 5: Inference (The Bot Playing)
import pydirectinput # Mais confiável para jogos DirectX/Flash

def run_bot(model_path):
    model = NexusNet()
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    with mss.mss() as sct:
        while True:
            # 1. Ver
            img = np.array(sct.grab(MONITOR))
            # ... pré-processamento ...
            
            # 2. Pensar
            with torch.no_grad():
                prediction = model(img)
            
            # 3. Agir
            if prediction[0] > 0.5: pydirectinput.keyDown('up')
            else: pydirectinput.keyUp('up')
            
            # ... repetir para outras teclas ...
`
};
