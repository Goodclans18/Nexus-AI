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
# Nexus AI - Step 3: Neural Network Architecture (NexusNet v2)
import torch
import torch.nn as nn
import torch.nn.functional as F

class NexusNet(nn.Module):
    def __init__(self, num_actions=7): # up, down, left, right, x, c, v
        super(NexusNet, self).__init__()
        # Input: 160x120 Grayscale
        self.conv1 = nn.Conv2d(1, 32, kernel_size=8, stride=4)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=4, stride=2)
        self.conv3 = nn.Conv2d(64, 64, kernel_size=3, stride=1)
        
        self.fc1 = nn.Linear(64 * 16 * 11, 512)
        self.fc2 = nn.Linear(512, num_actions)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))
`,
  TRAIN: `
# Nexus AI - Step 4: Training Loop (v2)
import torch.optim as optim
import torch

def train_model(model, dataloader):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.00025)
    
    print(f"Treinando em: {device}")
    
    model.train()
    for epoch in range(25):
        running_loss = 0.0
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        print(f"Epoch {epoch+1}/25 - Loss: {running_loss/len(dataloader):.4f}")
`,
  DATA_SCAN: `
# Nexus AI - Step 6: Deep System Scan (Filesystem)
import os
import json
import cv2

# Este script seria executado localmente para ler os arquivos do jogo
# e extrair as framedatas reais e sprites para o dashboard.

def scan_game_directory(game_path):
    print(f"Iniciando varredura profunda em: {game_path}")
    chars_dir = os.path.join(game_path, "data", "chars")
    
    if not os.path.exists(chars_dir):
        return {"error": "Diretório de personagens não encontrado."}
        
    discovery = []
    for char_id in os.listdir(chars_dir):
        char_path = os.path.join(chars_dir, char_id)
        if os.path.isdir(char_path):
            # Extraindo framedata (simulado de JSON ou Binário)
            discovery.append({
                "id": char_id,
                "sprites": len([f for f in os.listdir(char_path) if f.endswith('.png')]),
                "status": "MAPPED"
            })
            
    print(f"Sucesso: {len(discovery)} personagens identificados.")
    return discovery

if __name__ == "__main__":
    # O dashboard passa o caminho configurado via CLI
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "C:/Games/SSF2"
    scan_game_directory(path)
`,
  EXEC: `
# Nexus AI - Step 5: High-Performance Inference (NexusNet Core)
import pydirectinput
import keyboard
import torch
import cv2
import mss
import numpy as np
import requests
import os
import sys

# Configurações de Performance
pydirectinput.PAUSE = 0
ACTIONS = ['up', 'down', 'left', 'right', 'x', 'c', 'v']
THRESHOLD = 0.65
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
VERSION = "2.1.0"
DASHBOARD_URL = "http://localhost:3000"

def check_for_updates():
    print(f"--- Verificando Versão (Atual: {VERSION}) ---")
    try:
        response = requests.get(f"{DASHBOARD_URL}/api/agent/sync")
        if response.status_code == 200:
            data = response.json()
            if data['version'] != VERSION:
                print(f"!!! Nova versão detectada: {data['version']} !!!")
                print("--- Autoupdate: Sincronizando scripts locais ---")
                # Lógica para sobrescrever o arquivo atual com os scripts recebidos
                # (Simulado para o ambiente local)
                return True
        print("Nexus AI está atualizado.")
    except Exception as e:
        print(f"Aviso: Não foi possível sincronizar com o dashboard. Erro: {e}")
    return False

def run_bot(model_path="nexus_model.pth"):
    if check_for_updates():
        print("Reinicie o agente para aplicar as atualizações.")
        # sys.exit(0)
    
    model = NexusNet(num_actions=len(ACTIONS))
    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    
    print(f"Nexus AI Ativo em {DEVICE}. Pressione 'ESC' para parar.")
    
    with mss.mss() as sct:
        monitor = {"top": 40, "left": 0, "width": 800, "height": 600}
        
        while not keyboard.is_pressed('esc'):
            # 1. Captura e Pré-processamento (Igual ao treino)
            img = np.array(sct.grab(monitor))
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
            img = cv2.resize(img, (160, 120))
            img = img.reshape(1, 1, 120, 160).astype(np.float32) / 255.0
            
            # 2. Inferência
            tensor_img = torch.from_numpy(img).to(DEVICE)
            with torch.no_grad():
                outputs = model(tensor_img).cpu().numpy()[0]
            
            # 3. Mapeamento de Teclas (Multi-label)
            for i, action in enumerate(ACTIONS):
                if outputs[i] > THRESHOLD:
                    pydirectinput.keyDown(action)
                else:
                    pydirectinput.keyUp(action)
    
    # Release all keys on exit
    for action in ACTIONS: pydirectinput.keyUp(action)
    print("Nexus AI Desativado com Segurança.")
`,
  KEY_ROTATOR: `
# Nexus AI - Utility: API Key Rotation
# Gerencia múltiplas chaves para evitar interrupções por quota

class KeyPool:
    def __init__(self, keys):
        self.keys = keys
        self.current_index = 0
        self.active_key = keys[0]

    def rotate(self):
        self.current_index += 1
        if self.current_index >= len(self.keys):
            print("!!! ALERTA: Todas as chaves esgotadas. Aguardando recarga...")
            return False
            
        self.active_key = self.keys[self.current_index]
        print(f"--- MUDANÇA DE ROTA: Usando chave #{self.current_index + 1}")
        return True

    def call_api(self, func, *args, **kwargs):
        while True:
            try:
                return func(self.active_key, *args, **kwargs)
            except Exception as e:
                if "quota" in str(e).lower():
                    if not self.rotate():
                        raise Exception("RECARGA NECESSÁRIA: Aguarde novos tokens.")
                else:
                    raise e
`
};
