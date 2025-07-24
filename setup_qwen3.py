#!/usr/bin/env python3
"""
Qwen 3 Coder Setup Script
Based on the official Qwen 3 Coder documentation: https://qwenlm.github.io/blog/qwen3-coder/
"""

import os
import sys
import subprocess

def install_packages():
    """Install required packages for Qwen 3 Coder"""
    packages = [
        "torch",
        "transformers>=4.37.0", 
        "accelerate",
        "tiktoken",
        "einops",
        "transformers_stream_generator",
        "huggingface_hub"
    ]
    
    print("Installing Qwen 3 Coder dependencies...")
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
            return False
    
    return True

def create_qwen_cli():
    """Create a simple CLI interface for Qwen 3 Coder"""
    cli_script = '''#!/usr/bin/env python3
"""
Qwen 3 Coder CLI Interface
Usage: python qwen3_cli.py "Your coding question or task"
"""

import sys
import warnings
warnings.filterwarnings("ignore")

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    import torch
except ImportError as e:
    print("Error: Missing required packages. Please run setup_qwen3.py first.")
    print(f"Import error: {e}")
    sys.exit(1)

class QwenCoder:
    def __init__(self, model_name="Qwen/Qwen2.5-Coder-7B-Instruct"):
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_model(self):
        """Load the Qwen 3 Coder model"""
        print(f"Loading {self.model_name}...")
        print(f"Using device: {self.device}")
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )
            
            if self.device == "cpu":
                self.model = self.model.to(self.device)
                
            print("✓ Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"✗ Failed to load model: {e}")
            return False
    
    def generate_response(self, prompt, max_length=2048):
        """Generate a response using Qwen 3 Coder"""
        if not self.model or not self.tokenizer:
            print("Error: Model not loaded. Please load the model first.")
            return None
            
        try:
            # Format the prompt for code generation
            messages = [
                {"role": "system", "content": "You are Qwen, a helpful AI assistant specialized in coding and programming tasks."},
                {"role": "user", "content": prompt}
            ]
            
            text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.8,
                    repetition_penalty=1.1,
                    eos_token_id=self.tokenizer.eos_token_id,
                    pad_token_id=self.tokenizer.pad_token_id
                )
            
            response = self.tokenizer.decode(outputs[0][inputs.input_ids.shape[-1]:], skip_special_tokens=True)
            return response.strip()
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python qwen3_cli.py \\"Your coding question or task\\"")
        print("\\nExample:")
        print('python qwen3_cli.py "Write a Python function to calculate fibonacci numbers"')
        sys.exit(1)
    
    prompt = " ".join(sys.argv[1:])
    
    print("Qwen 3 Coder CLI")
    print("=" * 50)
    print(f"Query: {prompt}")
    print("=" * 50)
    
    # Initialize Qwen Coder
    qwen = QwenCoder()
    
    if not qwen.load_model():
        print("Failed to load the model. Please check your installation.")
        sys.exit(1)
    
    print("\\nGenerating response...")
    response = qwen.generate_response(prompt)
    
    if response:
        print("\\nQwen 3 Coder Response:")
        print("-" * 30)
        print(response)
    else:
        print("Failed to generate response.")

if __name__ == "__main__":
    main()
'''
    
    with open("qwen3_cli.py", "w") as f:
        f.write(cli_script)
    
    # Make it executable
    os.chmod("qwen3_cli.py", 0o755)
    print("✓ Created qwen3_cli.py")

def create_quick_setup():
    """Create a quick setup script for easier activation"""
    setup_script = '''#!/bin/bash
# Qwen 3 Coder Quick Setup
echo "Qwen 3 Coder Quick Setup"
echo "========================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Install dependencies
echo "Installing Qwen 3 Coder dependencies..."
python3 setup_qwen3.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Setup complete!"
    echo ""
    echo "Usage:"
    echo "  python3 qwen3_cli.py \\"Your coding question\\""
    echo ""
    echo "Example:"
    echo "  python3 qwen3_cli.py \\"Write a Python function to sort a list\\""
else
    echo "✗ Setup failed"
    exit 1
fi
'''
    
    with open("qwen_setup.sh", "w") as f:
        f.write(setup_script)
    
    os.chmod("qwen_setup.sh", 0o755)
    print("✓ Created qwen_setup.sh")

def main():
    print("Qwen 3 Coder Setup")
    print("==================")
    
    # Install packages
    if install_packages():
        print("\n✓ All packages installed successfully!")
    else:
        print("\n✗ Package installation failed")
        return False
    
    # Create CLI interface
    create_qwen_cli()
    create_quick_setup()
    
    print("\nSetup Summary:")
    print("- Created qwen3_cli.py (main CLI interface)")
    print("- Created qwen_setup.sh (quick setup script)")
    
    print("\nNext Steps:")
    print("1. Run: python3 qwen3_cli.py \"Your coding question\"")
    print("2. The first run will download the model (may take some time)")
    print("3. Example: python3 qwen3_cli.py \"Write a React component for a button\"")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)