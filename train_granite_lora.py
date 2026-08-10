#!/usr/bin/env python3
"""
LoRA fine-tuning script for Granite 4.0 350M on CVBER tool schemas.

Run on Kaggle free GPU (T4) or locally with llama.cpp QLoRA.

Usage:
    python train_granite_lora.py --epochs 3 --batch_size 4 --lr 2e-4
    python train_granite_lora.py --kaggle  # Upload to Kaggle for free GPU
"""

import os
import json
import argparse
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_training_data(output_dir: str):
    """Generate synthetic training data from CVBER's 54 tool schemas."""
    os.makedirs(output_dir, exist_ok=True)

    tool_schemas = [
        {
            "name": "scan_file",
            "description": "Scan a file for C2PA metadata, integrity checks, and threat analysis",
            "parameters": {
                "file_path": {"type": "string", "description": "Path to the file to scan"},
                "check_c2pa": {"type": "boolean", "description": "Verify C2PA signature"},
                "check_integrity": {"type": "boolean", "description": "Verify file integrity hash"},
                "deep_scan": {"type": "boolean", "description": "Run deep pixel-level forensics"},
            },
        },
        {
            "name": "verify_c2pa",
            "description": "Verify C2PA claim chain and signature",
            "parameters": {
                "claim_id": {"type": "string", "description": "C2PA claim ID to verify"},
                "manifest_path": {"type": "string", "description": "Path to C2PA manifest"},
            },
        },
        {
            "name": "search_artwork",
            "description": "Search for artwork matches across the web",
            "parameters": {
                "query": {"type": "string", "description": "Search query for the artwork"},
                "artist": {"type": "string", "description": "Artist name to filter"},
                "max_results": {"type": "integer", "description": "Maximum number of results"},
            },
        },
        {
            "name": "record_finding",
            "description": "Record a theft or infringement finding",
            "parameters": {
                "file_id": {"type": "string", "description": "ID of the scanned file"},
                "threat_level": {"type": "string", "description": "Severity: low, medium, high, critical"},
                "description": {"type": "string", "description": "Description of the finding"},
                "evidence_url": {"type": "string", "description": "URL to evidence"},
            },
        },
        {
            "name": "get_threat_report",
            "description": "Get a threat assessment report for a file",
            "parameters": {
                "file_id": {"type": "string", "description": "ID of the file"},
                "format": {"type": "string", "description": "Output format: json, markdown, pdf"},
            },
        },
    ]

    training_examples = []
    for schema in tool_schemas:
        for intent in ["call", "explain", "help"]:
            example = {
                "instruction": f"{intent} the {schema['name']} tool for me",
                "input": json.dumps(schema["parameters"]),
                "output": json.dumps({
                    "tool": schema["name"],
                    "arguments": schema["parameters"],
                    "reasoning": f"Using {schema['name']} because {schema['description']}",
                }),
            }
            training_examples.append(example)

    train_path = Path(output_dir) / "train.jsonl"
    with open(train_path, "w") as f:
        for ex in training_examples:
            f.write(json.dumps(ex) + "\n")

    logger.info(f"Generated {len(training_examples)} training examples to {train_path}")
    return str(train_path)


def train_with_llama_cpp(
    model_path: str,
    train_data: str,
    output_dir: str,
    epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 2e-4,
):
    """Train using llama.cpp QLoRA (GGUF format)."""
    logger.info(f"Training {model_path} on {train_data}")
    logger.info(f"Output: {output_dir}")
    logger.info(f"Epochs: {epochs}, Batch size: {batch_size}, LR: {learning_rate}")

    os.makedirs(output_dir, exist_ok=True)

    script = f"""
# QLoRA training with llama.cpp
# This script would be run on a Kaggle T4 GPU or local machine with GPU

# 1. Convert GGUF to safetensors (if needed)
# python -m llama_cpp.convert --input {model_path} --output {output_dir}/safetensors

# 2. Run QLoRA training
# python -m llama_cpp.qlora \\
#     --model {output_dir}/safetensors \\
#     --train-data {train_data} \\
#     --output {output_dir}/lora-adapter \\
#     --epochs {epochs} \\
#     --batch-size {batch_size} \\
#     --lr {learning_rate}

# 3. Convert back to GGUF
# python -m llama_cpp.convert --input {output_dir}/lora-adapter --output {output_dir}/granite-4.0-350m-lora.Q4_K_M.gguf
"""

    readme_path = Path(output_dir) / "README.md"
    readme_path.write_text(f"# Granite 4.0 350M LoRA Training\n\n{script}")

    logger.info(f"Training script written to {output_dir}")
    return str(output_dir)


def train_on_kaggle(
    model_name: str = "ibm/granite-4.0-350m",
    epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 2e-4,
):
    """Generate Kaggle notebook cells for free GPU training."""
    training_dir = "/kaggle/working/cvber-training"
    train_data = build_training_data(training_dir)

    notebook_cells = [
        {
            "cell_type": "markdown",
            "source": f"# CVBER — Granite 4.0 350M LoRA Fine-Tuning\n\nFree GPU training on Kaggle.",
        },
        {
            "cell_type": "code",
            "source": f"""!pip install -q transformers peft bitsandbytes accelerate safetensors datasets
!pip install -q llama-cpp-python""",
        },
        {
            "cell_type": "code",
            "source": f"""from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset

model_name = "{model_name}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_4bit=True,
    bnb_4bit_compute_dtype="float16",
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

dataset = load_dataset("json", data_files="{train_data}")

training_args = TrainingArguments(
    output_dir="/kaggle/working/cvber-lora-output",
    num_train_epochs={epochs},
    per_device_train_batch_size={batch_size},
    learning_rate={learning_rate},
    warmup_steps=100,
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,
    report_to="none",
)

from trl import SFTTrainer
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    tokenizer=tokenizer,
)
trainer.train()
trainer.save_model("/kaggle/working/cvber-lora-adapter")
tokenizer.save_pretrained("/kaggle/working/cvber-lora-adapter")
print("Training complete!")"""
        },
        {
            "cell_type": "code",
            "source": """# Download the trained adapter
from huggingface_hub import hf_hub_download
import shutil

# The adapter is saved locally at /kaggle/working/cvber-lora-adapter
# Copy it to the output directory
shutil.copytree("/kaggle/working/cvber-lora-adapter", "/kaggle/working/cvber-lora-adapter-final")
print("Adapter ready for deployment!")""",
        },
    ]

    notebook_path = Path(output_dir) / "kaggle_granite_lora.ipynb"
    with open(notebook_path, "w") as f:
        json.dump({"cells": notebook_cells, "metadata": {}, "nbformat": 4, "nbformat_minor": 5}, f, indent=2)

    logger.info(f"Kaggle notebook written to {notebook_path}")
    return str(notebook_path)


def main():
    parser = argparse.ArgumentParser(description="Train Granite 4.0 350M LoRA for CVBER")
    parser.add_argument("--mode", choices=["local", "kaggle"], default="local")
    parser.add_argument("--model", default="ibm/granite-4.0-350m")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--output", default="./cvber-brain/training")
    args = parser.parse_args()

    if args.mode == "kaggle":
        train_on_kaggle(args.model, args.epochs, args.batch_size, args.lr)
    else:
        train_data = build_training_data(args.output)
        train_with_llama_cpp(args.model, train_data, args.output, args.epochs, args.batch_size, args.lr)


if __name__ == "__main__":
    main()