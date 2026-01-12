"""
ImageCryptoLab Evaluation Framework
Comprehensive evaluation of encryption correctness, image quality, and functional completeness
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
from custom_evaluators import (
    EncryptionCorrectnessEvaluator,
    ImageProcessingQualityEvaluator,
    FunctionalCompletenessEvaluator
)


class ImageCryptoLabEvaluator:
    """Main evaluation orchestrator for ImageCryptoLab"""
    
    def __init__(self, dataset_path: str = "test_dataset.jsonl"):
        self.dataset_path = dataset_path
        self.encryption_evaluator = EncryptionCorrectnessEvaluator()
        self.quality_evaluator = ImageProcessingQualityEvaluator()
        self.completeness_evaluator = FunctionalCompletenessEvaluator()
        self.results = {
            "overall_results": [],
            "metrics_by_type": {},
            "aggregate_scores": {}
        }
    
    def load_dataset(self) -> List[Dict[str, Any]]:
        """Load test dataset from JSONL file"""
        data = []
        try:
            with open(self.dataset_path, 'r') as f:
                for line in f:
                    if line.strip():
                        data.append(json.loads(line))
            print(f"✅ Loaded {len(data)} test cases from {self.dataset_path}")
            return data
        except FileNotFoundError:
            print(f"❌ Dataset file not found: {self.dataset_path}")
            return []
    
    def evaluate_test_case(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a single test case using appropriate evaluators"""
        test_type = test_case.get("test_type", "unknown")
        result = {
            "test_id": test_case.get("test_id"),
            "test_type": test_type,
            "evaluations": {}
        }
        
        # Route to appropriate evaluators based on test type
        if test_type.startswith("encryption") or test_type.startswith("decryption"):
            result["evaluations"]["encryption"] = self.encryption_evaluator(**test_case)
        
        if test_type.startswith("image"):
            result["evaluations"]["image_quality"] = self.quality_evaluator(**test_case)
        
        if test_type == "ui_functionality" or test_type == "encoding":
            result["evaluations"]["functional_completeness"] = self.completeness_evaluator(**test_case)
        
        # Compute individual test score
        scores = [v.get("correctness_score") or v.get("quality_score") or v.get("completeness_score", 0.0) 
                 for v in result["evaluations"].values()]
        result["overall_score"] = sum(scores) / len(scores) if scores else 0.0
        
        return result
    
    def run_evaluation(self) -> Dict[str, Any]:
        """Run complete evaluation on all test cases"""
        print("\n" + "="*70)
        print("ImageCryptoLab Evaluation Framework")
        print("="*70)
        
        # Load dataset
        test_cases = self.load_dataset()
        if not test_cases:
            print("❌ No test cases found. Exiting.")
            return self.results
        
        # Evaluate each test case
        print(f"\n📊 Running {len(test_cases)} test cases...\n")
        
        for i, test_case in enumerate(test_cases, 1):
            result = self.evaluate_test_case(test_case)
            self.results["overall_results"].append(result)
            
            # Print progress
            status = "✅ PASS" if result["overall_score"] >= 0.8 else "⚠️  PARTIAL" if result["overall_score"] >= 0.5 else "❌ FAIL"
            print(f"  {i:2d}. [{result['test_id']}] {result['test_type']:25s} {status} (Score: {result['overall_score']:.2f})")
        
        # Compute aggregate metrics
        self._compute_aggregate_metrics()
        
        # Print summary
        self._print_summary()
        
        return self.results
    
    def _compute_aggregate_metrics(self):
        """Compute aggregate metrics across all tests"""
        if not self.results["overall_results"]:
            return
        
        # Group by test type
        by_type = {}
        for result in self.results["overall_results"]:
            test_type = result["test_type"]
            if test_type not in by_type:
                by_type[test_type] = []
            by_type[test_type].append(result["overall_score"])
        
        # Calculate metrics for each type
        for test_type, scores in by_type.items():
            self.results["metrics_by_type"][test_type] = {
                "count": len(scores),
                "average_score": sum(scores) / len(scores),
                "min_score": min(scores),
                "max_score": max(scores),
                "pass_rate": len([s for s in scores if s >= 0.8]) / len(scores)
            }
        
        # Overall aggregate scores
        all_scores = [r["overall_score"] for r in self.results["overall_results"]]
        self.results["aggregate_scores"] = {
            "total_tests": len(all_scores),
            "overall_average": sum(all_scores) / len(all_scores),
            "overall_pass_rate": len([s for s in all_scores if s >= 0.8]) / len(all_scores),
            "min_score": min(all_scores),
            "max_score": max(all_scores),
            "evaluators_used": [
                self.encryption_evaluator.name,
                self.quality_evaluator.name,
                self.completeness_evaluator.name
            ]
        }
    
    def _print_summary(self):
        """Print evaluation summary"""
        agg = self.results["aggregate_scores"]
        
        print("\n" + "="*70)
        print("📈 EVALUATION SUMMARY")
        print("="*70)
        print(f"\n🎯 Overall Results:")
        print(f"   Total Tests: {agg['total_tests']}")
        print(f"   Average Score: {agg['overall_average']:.2%}")
        print(f"   Pass Rate (≥80%): {agg['overall_pass_rate']:.2%}")
        print(f"   Score Range: {agg['min_score']:.2f} - {agg['max_score']:.2f}")
        
        print(f"\n📊 Metrics by Test Type:")
        for test_type, metrics in sorted(self.results["metrics_by_type"].items()):
            print(f"\n   {test_type}:")
            print(f"      Tests: {metrics['count']}")
            print(f"      Avg Score: {metrics['average_score']:.2%}")
            print(f"      Pass Rate: {metrics['pass_rate']:.2%}")
        
        print(f"\n🔍 Evaluators Used:")
        for evaluator in agg["evaluators_used"]:
            print(f"   • {evaluator}")
        
        print("\n" + "="*70)
    
    def save_results(self, output_path: str = "evaluation_results.json"):
        """Save evaluation results to JSON file"""
        try:
            with open(output_path, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"\n✅ Results saved to {output_path}")
        except Exception as e:
            print(f"❌ Error saving results: {e}")


def main():
    """Main entry point for evaluation"""
    # Get script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Run evaluation
    evaluator = ImageCryptoLabEvaluator(dataset_path="test_dataset.jsonl")
    results = evaluator.run_evaluation()
    
    # Save results
    evaluator.save_results("evaluation_results.json")
    
    # Return exit code based on overall pass rate
    pass_rate = results["aggregate_scores"]["overall_pass_rate"]
    exit_code = 0 if pass_rate >= 0.8 else 1 if pass_rate >= 0.5 else 2
    
    print(f"\n🚀 Evaluation complete. Exit code: {exit_code}")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
