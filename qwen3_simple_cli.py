#!/usr/bin/env python3
"""
Simple Qwen 3 Coder CLI Setup
This version uses the Hugging Face Inference API for easier setup
"""

import sys
import os
import requests
import json

class QwenCoderAPI:
    def __init__(self):
        self.model_name = "Qwen/Qwen2.5-Coder-7B-Instruct"
        self.api_url = f"https://huggingface.co/api/models/{self.model_name}/generate"
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        
    def check_setup(self):
        """Check if the setup is ready"""
        if not self.hf_token:
            print("⚠️  HUGGINGFACE_TOKEN environment variable not set.")
            print("To use this CLI, you need a Hugging Face token:")
            print("1. Go to https://huggingface.co/settings/tokens")
            print("2. Create a new token")
            print("3. Set it as an environment variable:")
            print("   export HUGGINGFACE_TOKEN='your_token_here'")
            return False
        return True
    
    def generate_code(self, prompt, max_tokens=1000):
        """Generate code using Qwen 2.5 Coder"""
        if not self.check_setup():
            return None
            
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json"
        }
        
        # Format the prompt for coding tasks
        system_prompt = "You are Qwen, a helpful AI assistant specialized in coding and programming tasks. Provide clear, well-commented code solutions."
        formatted_prompt = f"<|im_start|>system\\n{system_prompt}<|im_end|>\\n<|im_start|>user\\n{prompt}<|im_end|>\\n<|im_start|>assistant\\n"
        
        data = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.8,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        try:
            print("🔄 Generating response...")
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "").strip()
                elif isinstance(result, dict):
                    return result.get("generated_text", "").strip()
                else:
                    return "Unexpected response format"
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return None

def create_local_model_script():
    """Create a script for running Qwen locally (requires more setup)"""
    local_script = '''#!/usr/bin/env python3
"""
Local Qwen 3 Coder Setup (Advanced)
This requires installing transformers, torch, and downloading the model
"""

import os
import sys

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    import torch
except ImportError:
    print("❌ Required packages not installed.")
    print("Run: pip install transformers torch accelerate")
    sys.exit(1)

class LocalQwenCoder:
    def __init__(self, model_name="Qwen/Qwen2.5-Coder-7B-Instruct"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🖥️  Using device: {self.device}")
        
    def setup_model(self):
        """Download and setup the model locally"""
        print(f"📥 Loading {self.model_name}...")
        print("⚠️  First run will download ~14GB model - this may take time!")
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Use appropriate settings based on device
            if self.device == "cuda":
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True
                )
            else:
                print("⚠️  Using CPU - this will be slower")
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                    trust_remote_code=True
                ).to(self.device)
            
            print("✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            return False
    
    def generate(self, prompt, max_tokens=1000):
        """Generate code locally"""
        messages = [
            {"role": "system", "content": "You are Qwen, a helpful AI assistant specialized in coding."},
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
                max_new_tokens=max_tokens,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[-1]:], 
            skip_special_tokens=True
        )
        return response.strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 qwen3_local.py \\"Your coding question\\"")
        sys.exit(1)
    
    prompt = " ".join(sys.argv[1:])
    qwen = LocalQwenCoder()
    
    if qwen.setup_model():
        response = qwen.generate(prompt)
        print("\\n" + "="*50)
        print("Qwen 3 Coder Response:")
        print("="*50)
        print(response)
'''
    
    with open("qwen3_local.py", "w") as f:
        f.write(local_script)
    
    os.chmod("qwen3_local.py", 0o755)
    print("✅ Created qwen3_local.py for advanced local setup")

def main():
    print("Qwen 3 Coder CLI")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("🤖 Usage:")
        print("  python3 qwen3_simple_cli.py \"Your coding question\"")
        print("")
        print("📚 Examples:")
        print("  python3 qwen3_simple_cli.py \"Write a Python function to calculate fibonacci\"")
        print("  python3 qwen3_simple_cli.py \"Create a React component for a todo list\"")
        print("  python3 qwen3_simple_cli.py \"Debug this JavaScript code: console.log(undefined.length)\"")
        print("")
        print("🔧 Setup:")
        print("  1. Get a token from https://huggingface.co/settings/tokens")
        print("  2. Run: export HUGGINGFACE_TOKEN='your_token_here'")
        print("  3. Use this CLI for instant coding help!")
        sys.exit(0)
    
    prompt = " ".join(sys.argv[1:])
    
    print(f"🤔 Question: {prompt}")
    print("-" * 50)
    
    qwen = QwenCoderAPI()
    response = qwen.generate_code(prompt)
    
    if response:
        print("🚀 Qwen 3 Coder Response:")
        print("-" * 30)
        print(response)
        print("-" * 30)
        print("✅ Done!")
    else:
        print("❌ Failed to generate response.")
        print("\n💡 Troubleshooting:")
        print("  - Check your HUGGINGFACE_TOKEN is set correctly")
        print("  - Ensure you have internet connection")
        print("  - Try a simpler prompt")

if __name__ == "__main__":
    main()