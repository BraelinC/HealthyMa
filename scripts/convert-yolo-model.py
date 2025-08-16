#!/usr/bin/env python3
"""
YOLOv8n to TensorFlow.js Model Converter
This script downloads and converts YOLOv8n model for browser-based food detection.
"""

import os
import sys
import shutil
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed."""
    try:
        import ultralytics
        print("✅ Ultralytics installed")
    except ImportError:
        print("❌ Ultralytics not installed. Installing...")
        os.system("pip install ultralytics")
        import ultralytics
    
    return True

def download_and_convert_model():
    """Download YOLOv8n and convert to TensorFlow.js format."""
    from ultralytics import YOLO
    
    print("\n🚀 Starting YOLOv8n model conversion...")
    
    # Create output directory
    output_dir = Path("../client/public/models")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Load YOLOv8n model (smallest and fastest)
        print("📥 Downloading YOLOv8n model...")
        model = YOLO("yolov8n.pt")
        print("✅ Model downloaded successfully")
        
        # Export to TensorFlow.js format
        print("🔄 Converting to TensorFlow.js format...")
        export_path = model.export(
            format="tfjs",
            imgsz=640,  # Standard YOLOv8 input size
            half=False,  # Full precision for browser compatibility
            int8=False   # No quantization for better accuracy
        )
        print(f"✅ Model exported to: {export_path}")
        
        # Move to public directory
        model_name = "yolov8n_web_model"
        target_dir = output_dir / model_name
        
        # Remove existing model if present
        if target_dir.exists():
            shutil.rmtree(target_dir)
        
        # Copy exported model to target location
        shutil.copytree(export_path, target_dir)
        print(f"✅ Model copied to: {target_dir}")
        
        # Create labels.json for COCO classes
        coco_labels = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
            'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
            'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
            'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
            'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
            'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ]
        
        import json
        labels_path = target_dir / "labels.json"
        with open(labels_path, 'w') as f:
            json.dump(coco_labels, f, indent=2)
        print(f"✅ Labels saved to: {labels_path}")
        
        # Print model info
        print("\n📊 Model Information:")
        print(f"  - Model: YOLOv8n")
        print(f"  - Input size: 640x640")
        print(f"  - Classes: {len(coco_labels)} (COCO)")
        print(f"  - Format: TensorFlow.js")
        print(f"  - Location: {target_dir}")
        
        # Check file sizes
        total_size = sum(f.stat().st_size for f in target_dir.rglob('*') if f.is_file())
        print(f"  - Total size: {total_size / (1024*1024):.2f} MB")
        
        print("\n✨ Model conversion complete!")
        print("\n📝 Next steps:")
        print("1. The model is now available at: /models/yolov8n_web_model/")
        print("2. Update foodDetection.ts to load the real model")
        print("3. Test detection in the browser")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return False

def create_custom_food_trainer():
    """Create a script for training custom food detection model."""
    
    trainer_script = '''#!/usr/bin/env python3
"""
Train YOLOv8n on Custom Food Dataset
"""

from ultralytics import YOLO
import yaml

# Configuration for food dataset
food_dataset_config = {
    'path': '../datasets/food-detection',
    'train': 'images/train',
    'val': 'images/val',
    'test': 'images/test',
    'nc': 101,  # Number of food classes (e.g., Food-101)
    'names': [
        'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare',
        'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito',
        'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake',
        'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla',
        'chicken_wings', 'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder',
        'club_sandwich', 'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes',
        'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict',
        'escargots', 'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras',
        'french_fries', 'french_onion_soup', 'french_toast', 'fried_calamari', 'fried_rice',
        'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich',
        'grilled_salmon', 'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup',
        'hot_dog', 'huevos_rancheros', 'hummus', 'ice_cream', 'lasagna',
        'lobster_bisque', 'lobster_roll_sandwich', 'macaroni_and_cheese', 'macarons', 'miso_soup',
        'mussels', 'nachos', 'omelette', 'onion_rings', 'oysters',
        'pad_thai', 'paella', 'pancakes', 'panna_cotta', 'peking_duck',
        'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib',
        'pulled_pork_sandwich', 'ramen', 'ravioli', 'red_velvet_cake', 'risotto',
        'samosa', 'sashimi', 'scallops', 'seaweed_salad', 'shrimp_and_grits',
        'spaghetti_bolognese', 'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake',
        'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare',
        'waffles'
    ]
}

def train_food_model():
    """Train YOLOv8n on food dataset."""
    
    # Save dataset config
    with open('food_dataset.yaml', 'w') as f:
        yaml.dump(food_dataset_config, f)
    
    # Load base model
    model = YOLO('yolov8n.pt')
    
    # Train on food dataset
    results = model.train(
        data='food_dataset.yaml',
        epochs=100,
        imgsz=640,
        batch=16,
        patience=10,
        save=True,
        device='0',  # Use GPU if available
        project='food_detection',
        name='yolov8n_food',
        exist_ok=True,
        pretrained=True,
        optimizer='SGD',
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        label_smoothing=0.0,
        nbs=64,
        overlap_mask=True,
        mask_ratio=4,
        dropout=0.0,
        val=True
    )
    
    # Export to TensorFlow.js
    model.export(format='tfjs')
    
    print("Training complete! Model exported to TensorFlow.js format.")

if __name__ == "__main__":
    train_food_model()
'''
    
    trainer_path = Path("train_food_model.py")
    with open(trainer_path, 'w') as f:
        f.write(trainer_script)
    
    print(f"✅ Custom food trainer script created: {trainer_path}")
    print("   Run this script with a food dataset to train a specialized model")

def main():
    """Main conversion process."""
    print("=" * 50)
    print("YOLOv8n to TensorFlow.js Converter")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Convert model
    if download_and_convert_model():
        print("\n🎉 Success! YOLOv8n is ready for browser deployment.")
        
        # Create custom trainer script
        create_custom_food_trainer()
    else:
        print("\n❌ Conversion failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()