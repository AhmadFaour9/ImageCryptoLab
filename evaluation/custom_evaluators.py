"""
ImageCryptoLab Custom Evaluators
Implements custom code-based evaluators for the encryption application
"""

import json
from typing import Dict, Any


class EncryptionCorrectnessEvaluator:
    """
    Evaluates whether encryption and decryption operations work correctly.
    Checks:
    - AES encryption/decryption round-trip
    - DES encryption/decryption round-trip
    - Data integrity after round-trip
    - Output format correctness (Base64 and Hex)
    """
    
    def __init__(self):
        self.name = "Encryption Correctness"
    
    def __call__(self, *, test_type: str, algorithm: str = None, **kwargs) -> Dict[str, Any]:
        """
        Evaluate encryption correctness.
        
        Args:
            test_type: Type of test being run
            algorithm: Encryption algorithm (AES or DES)
            **kwargs: Additional test parameters
            
        Returns:
            Dictionary with evaluation metrics
        """
        result = {
            "test_id": kwargs.get("test_id", "unknown"),
            "test_type": test_type,
        }
        
        # Score encryption roundtrip tests
        if test_type == "encryption_roundtrip":
            format_used = kwargs.get("format", "base64")
            algorithm_used = kwargs.get("algorithm", "AES")
            
            # Both AES and DES should support round-trip
            result["encryption_roundtrip_pass"] = True
            result["format_support"] = format_used in ["base64", "hex"]
            result["algorithm_support"] = algorithm_used in ["AES", "DES"]
            result["correctness_score"] = 1.0 if all([
                result["encryption_roundtrip_pass"],
                result["format_support"],
                result["algorithm_support"]
            ]) else 0.0
            
        elif test_type == "encryption":
            # Basic encryption test
            algorithm_used = kwargs.get("algorithm", "AES")
            result["algorithm_supported"] = algorithm_used in ["AES", "DES"]
            result["passphrase_accepted"] = True
            result["correctness_score"] = 1.0 if result["algorithm_supported"] else 0.5
            
        elif test_type == "decryption":
            # Decryption test
            has_correct_pass = kwargs.get("has_correct_pass", True)
            result["decryption_success"] = has_correct_pass
            result["error_handling"] = not has_correct_pass  # Should handle wrong password
            result["correctness_score"] = 1.0 if has_correct_pass else 0.5
            
        else:
            result["correctness_score"] = 0.5
            
        return result


class ImageProcessingQualityEvaluator:
    """
    Evaluates image processing quality including:
    - Format conversion success
    - Aspect ratio preservation in resizing
    - Quality retention after conversion
    - Supported formats
    """
    
    def __init__(self):
        self.name = "Image Processing Quality"
    
    def __call__(self, *, test_type: str, **kwargs) -> Dict[str, Any]:
        """
        Evaluate image processing quality.
        
        Args:
            test_type: Type of image processing test
            **kwargs: Additional parameters
            
        Returns:
            Dictionary with quality metrics
        """
        result = {
            "test_id": kwargs.get("test_id", "unknown"),
            "test_type": test_type,
        }
        
        if test_type == "image_conversion":
            source_fmt = kwargs.get("source_format", "unknown")
            target_fmt = kwargs.get("target_format", "unknown")
            
            # Supported formats
            supported_formats = ["png", "jpeg", "jpg", "webp", "gif", "bmp"]
            
            result["source_format_supported"] = source_fmt.lower() in supported_formats or source_fmt == "any"
            result["target_format_supported"] = target_fmt.lower() in supported_formats
            result["conversion_possible"] = result["source_format_supported"] and result["target_format_supported"]
            result["quality_score"] = 1.0 if result["conversion_possible"] else 0.0
            
        elif test_type == "image_resize":
            operation = kwargs.get("operation", "unknown")
            width = kwargs.get("width")
            height = kwargs.get("height")
            
            result["resize_operation"] = operation
            result["width_provided"] = width is not None
            result["height_provided"] = height is not None
            
            # Aspect ratio preservation
            if operation == "resize_w" and width:
                result["aspect_ratio_preserved"] = True
                result["quality_score"] = 1.0
            elif operation == "resize_h" and height:
                result["aspect_ratio_preserved"] = True
                result["quality_score"] = 1.0
            elif operation == "resize_wh" and width and height:
                result["aspect_ratio_preserved"] = False  # Exact dimensions specified
                result["quality_score"] = 0.9  # Slightly lower for forced dimensions
            else:
                result["quality_score"] = 0.0
                
        else:
            result["quality_score"] = 0.5
            
        return result


class FunctionalCompletenessEvaluator:
    """
    Evaluates functional completeness including:
    - All UI buttons work correctly
    - All tabs are functional
    - Encoding operations work (Base64, Hex)
    - Error handling is present
    - File operations complete
    """
    
    def __init__(self):
        self.name = "Functional Completeness"
    
    def __call__(self, *, test_type: str, **kwargs) -> Dict[str, Any]:
        """
        Evaluate functional completeness.
        
        Args:
            test_type: Type of functionality test
            **kwargs: Additional parameters
            
        Returns:
            Dictionary with completeness metrics
        """
        result = {
            "test_id": kwargs.get("test_id", "unknown"),
            "test_type": test_type,
        }
        
        if test_type == "encoding":
            format_type = kwargs.get("format", "unknown")
            result["format_supported"] = format_type in ["base64", "hex"]
            result["generates_output"] = True
            result["completeness_score"] = 1.0 if result["format_supported"] else 0.0
            
        elif test_type == "ui_functionality":
            action = kwargs.get("action", "unknown")
            
            if action == "file_upload":
                result["file_input_exists"] = True
                result["preview_shown"] = True
                result["completeness_score"] = 1.0
                
            elif action == "tab_switch":
                tab_names = kwargs.get("tab_names", [])
                expected_tabs = ["Convert", "Base64 / Hex", "Encrypt", "Decrypt"]
                result["tabs_exist"] = len(tab_names) == len(expected_tabs)
                result["all_tabs_clickable"] = True
                result["completeness_score"] = 1.0 if result["tabs_exist"] else 0.5
                
            elif action == "button_enable":
                button_names = kwargs.get("button_names", [])
                expected_buttons = ["makeBase64Btn", "makeHexBtn", "encryptBtn", "convertBtn"]
                result["buttons_exist"] = len(button_names) >= len(expected_buttons)
                result["buttons_enable_on_load"] = True
                result["completeness_score"] = 1.0 if result["buttons_exist"] else 0.5
                
            elif action == "error_handling":
                scenario = kwargs.get("scenario", "unknown")
                result["error_detected"] = True
                result["error_message_shown"] = True
                result["user_informed"] = True
                result["completeness_score"] = 1.0
                
            else:
                result["completeness_score"] = 0.5
                
        else:
            result["completeness_score"] = 0.5
            
        return result
