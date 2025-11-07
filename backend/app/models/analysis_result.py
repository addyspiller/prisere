from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class AnalysisResult(Base):
    """
    AnalysisResult model for storing completed policy comparison analysis results.
    """
    __tablename__ = "analysis_results"

    # Primary key - same as job_id (one-to-one relationship)
    job_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), primary_key=True, index=True)
    
    # Summary data
    total_changes = Column(Integer, default=0, nullable=False)
    
    # Change categories breakdown (stored as JSON)
    # Example: {"coverage_limit": 3, "deductible": 2, "exclusion": 4, ...}
    change_categories = Column(JSON, nullable=True)
    
    # Detailed changes array (stored as JSON)
    # Example: [{"id": "change-1", "category": "coverage_limit", "change_type": "decreased", ...}]
    changes = Column(JSON, nullable=True)
    
    # Premium comparison (stored as JSON)
    # Example: {"baseline_premium": 15000, "renewal_premium": 16500, ...}
    premium_comparison = Column(JSON, nullable=True)
    
    # Suggested actions for broker (stored as JSON)
    # Example: [{"category": "coverage_limit", "action": "Review with broker...", ...}]
    suggested_actions = Column(JSON, nullable=True)
    
    # Educational insights (stored as JSON)
    # Example: [{"change_type": "coverage_limit_decrease", "insight": "When coverage limits...", ...}]
    educational_insights = Column(JSON, nullable=True)
    
    # Overall confidence score (0.0 to 1.0)
    confidence_score = Column(Float, nullable=True)
    
    # Metadata
    analysis_version = Column(String(50), default="1.0", nullable=False)
    model_version = Column(String(100), nullable=False)  # e.g., "claude-3-5-sonnet-20241022"
    processing_time_seconds = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    job = relationship("AnalysisJob", back_populates="result")

    def __repr__(self):
        return f"<AnalysisResult(job_id={self.job_id}, total_changes={self.total_changes})>"

    def to_dict(self):
        """Convert analysis result to dictionary representation (matches frontend API contract)."""
        return {
            "job_id": self.job_id,
            "status": "completed",  # Results only exist for completed jobs
            "summary": {
                "total_changes": self.total_changes,
                "change_categories": self.change_categories or {},
            },
            "changes": self.changes or [],
            "premium_comparison": self.premium_comparison or {},
            "suggested_actions": self.suggested_actions or [],
            "educational_insights": self.educational_insights or [],
            "metadata": {
                "analysis_version": self.analysis_version,
                "model_version": self.model_version,
                "processing_time_seconds": self.processing_time_seconds,
                "completed_at": self.created_at.isoformat() if self.created_at else None,
            },
        }

    @classmethod
    def from_claude_response(cls, job_id: str, claude_data: dict, model_version: str, processing_time: int):
        """
        Create AnalysisResult from Claude API response.
        
        Args:
            job_id: The analysis job ID
            claude_data: Parsed JSON response from Claude API
            model_version: Claude model version used
            processing_time: Processing time in seconds
            
        Returns:
            AnalysisResult instance
        """
        # Extract data from Claude response
        changes = claude_data.get("changes", [])
        change_categories = claude_data.get("summary", {}).get("change_categories", {})
        
        # Calculate average confidence if not provided
        confidence_score = None
        if changes:
            confidences = [c.get("confidence", 0) for c in changes if "confidence" in c]
            if confidences:
                confidence_score = sum(confidences) / len(confidences)
        
        return cls(
            job_id=job_id,
            total_changes=len(changes),
            change_categories=change_categories,
            changes=changes,
            premium_comparison=claude_data.get("premium_comparison"),
            suggested_actions=claude_data.get("suggested_actions", []),
            educational_insights=claude_data.get("educational_insights", []),
            confidence_score=confidence_score,
            model_version=model_version,
            processing_time_seconds=processing_time,
        )

