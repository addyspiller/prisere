#!/usr/bin/env python
"""
Test Claude service functionality.
Note: This requires a valid Anthropic API key in .env
"""
import sys
import os
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.claude_service import claude_service


def test_claude_comparison():
    """Test Claude policy comparison with sample data."""
    print("=" * 60)
    print("Claude Service Test")
    print("=" * 60)
    print()
    
    # Sample policy texts (simplified for testing)
    baseline_policy = """
    COMMERCIAL GENERAL LIABILITY INSURANCE POLICY
    
    Policy Number: CGL-2023-12345
    Effective Date: January 1, 2023
    Expiration Date: January 1, 2024
    
    COVERAGE LIMITS:
    - General Aggregate Limit: $2,000,000
    - Products-Completed Operations Aggregate: $2,000,000
    - Personal and Advertising Injury: $1,000,000
    - Each Occurrence: $1,000,000
    - Fire Damage (Any one fire): $50,000
    - Medical Expense (Any one person): $5,000
    
    DEDUCTIBLE:
    - Per Occurrence Deductible: $2,500
    
    ANNUAL PREMIUM: $15,000
    
    EXCLUSIONS:
    - Pollution
    - Professional Liability
    - Cyber Liability
    """
    
    renewal_policy = """
    COMMERCIAL GENERAL LIABILITY INSURANCE POLICY
    
    Policy Number: CGL-2024-67890
    Effective Date: January 1, 2024
    Expiration Date: January 1, 2025
    
    COVERAGE LIMITS:
    - General Aggregate Limit: $1,000,000
    - Products-Completed Operations Aggregate: $2,000,000
    - Personal and Advertising Injury: $1,000,000
    - Each Occurrence: $1,000,000
    - Fire Damage (Any one fire): $50,000
    - Medical Expense (Any one person): $5,000
    
    DEDUCTIBLE:
    - Per Occurrence Deductible: $3,500
    
    ANNUAL PREMIUM: $16,500
    
    EXCLUSIONS:
    - Pollution
    - Professional Liability
    - Cyber Liability
    - Employment Practices Liability
    """
    
    print("Baseline Policy:")
    print(f"  Length: {len(baseline_policy)} characters")
    print()
    
    print("Renewal Policy:")
    print(f"  Length: {len(renewal_policy)} characters")
    print()
    
    try:
        print("Calling Claude API to compare policies...")
        print("(This may take 10-30 seconds)")
        print()
        
        result = claude_service.compare_policies(
            baseline_text=baseline_policy,
            renewal_text=renewal_policy
        )
        
        print("✅ Comparison completed successfully!")
        print()
        
        # Display results
        print("=" * 60)
        print("COMPARISON RESULTS")
        print("=" * 60)
        print()
        
        print("Summary:")
        print(f"  {result['summary']}")
        print()
        
        print(f"Coverage Changes ({len(result['coverage_changes'])} found):")
        for idx, change in enumerate(result['coverage_changes'], 1):
            print(f"  {idx}. {change['title']}")
            print(f"     Category: {change['category']}")
            print(f"     Type: {change['change_type']}")
            print(f"     Baseline: {change['baseline_value']}")
            print(f"     Renewal: {change['renewal_value']}")
            if change.get('confidence'):
                print(f"     Confidence: {change['confidence']:.0%}")
            print()
        
        if result.get('premium_comparison'):
            print("Premium Comparison:")
            pc = result['premium_comparison']
            print(f"  Baseline: ${pc.get('baseline_premium', 0):,}")
            print(f"  Renewal: ${pc.get('renewal_premium', 0):,}")
            print(f"  Difference: ${pc.get('difference', 0):,}")
            if pc.get('percentage_change'):
                print(f"  Change: {pc['percentage_change']:+.1f}%")
            print()
        
        print(f"Broker Questions ({len(result['broker_questions'])} generated):")
        for idx, question in enumerate(result['broker_questions'], 1):
            print(f"  {idx}. {question}")
        print()
        
        # Save full result to file
        output_file = "test_claude_result.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"Full result saved to: {output_file}")
        print()
        
        print("=" * 60)
        print("✅ Claude test passed!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print()
    print("Note: This test requires a valid Anthropic API key")
    print("      Set ANTHROPIC_API_KEY in your .env file")
    print()
    
    success = test_claude_comparison()
    sys.exit(0 if success else 1)

