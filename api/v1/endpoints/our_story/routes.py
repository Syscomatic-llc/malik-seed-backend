from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.our_story.model import (
    OurStoryHero, OurStoryMission, OurStoryValue,
    OurStoryTimeline, OurStoryTeam, OurStoryAwards
)

router = APIRouter()


@router.get("/hero")
def get_hero(db: Session = Depends(get_db)):
    hero = db.query(OurStoryHero).filter(OurStoryHero.is_active == True).first()
    return hero


@router.get("/mission")
def get_mission(db: Session = Depends(get_db)):
    mission = db.query(OurStoryMission).filter(OurStoryMission.is_active == True).first()
    return mission


@router.get("/values")
def get_values(db: Session = Depends(get_db)):
    values = db.query(OurStoryValue).filter(OurStoryValue.is_active == True).order_by(OurStoryValue.sort_order).all()
    return values


@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    timeline = db.query(OurStoryTimeline).filter(OurStoryTimeline.is_active == True).order_by(OurStoryTimeline.sort_order).all()
    return timeline


@router.get("/team")
def get_team(db: Session = Depends(get_db)):
    team = db.query(OurStoryTeam).filter(OurStoryTeam.is_active == True).order_by(OurStoryTeam.sort_order).all()
    return team


@router.get("/team/leadership")
def get_leadership(db: Session = Depends(get_db)):
    leaders = db.query(OurStoryTeam).filter(OurStoryTeam.is_leadership == True, OurStoryTeam.is_active == True).order_by(OurStoryTeam.sort_order).all()
    return leaders


@router.get("/awards")
def get_awards(db: Session = Depends(get_db)):
    awards = db.query(OurStoryAwards).filter(OurStoryAwards.is_active == True).order_by(OurStoryAwards.sort_order).all()
    return awards


@router.get("/")
def get_all_our_story(db: Session = Depends(get_db)):
    return {
        "hero": db.query(OurStoryHero).filter(OurStoryHero.is_active == True).first(),
        "mission": db.query(OurStoryMission).filter(OurStoryMission.is_active == True).first(),
        "values": db.query(OurStoryValue).filter(OurStoryValue.is_active == True).order_by(OurStoryValue.sort_order).all(),
        "timeline": db.query(OurStoryTimeline).filter(OurStoryTimeline.is_active == True).order_by(OurStoryTimeline.sort_order).all(),
        "team": db.query(OurStoryTeam).filter(OurStoryTeam.is_active == True).order_by(OurStoryTeam.sort_order).all(),
        "leadership": db.query(OurStoryTeam).filter(OurStoryTeam.is_leadership == True, OurStoryTeam.is_active == True).order_by(OurStoryTeam.sort_order).all(),
        "awards": db.query(OurStoryAwards).filter(OurStoryAwards.is_active == True).order_by(OurStoryAwards.sort_order).all(),
    }
