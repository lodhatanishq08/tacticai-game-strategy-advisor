#!/usr/bin/env python3
"""
AI Game Strategy Advisor - Python Backend
Requires: flask, flask-cors, requests
Run: python3 server.py
"""

import os
import json
import csv
import io
import math
import re
from datetime import datetime
from flask import Flask, request, jsonify, send_file, make_response, send_from_directory
from flask_cors import CORS

# Try loading .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

IBM_API_KEY = os.environ.get('IBM_API_KEY', '')
IBM_PROJECT_ID = os.environ.get('IBM_PROJECT_ID', '')
IBM_ENDPOINT = os.environ.get('IBM_ENDPOINT', 'https://us-south.ml.cloud.ibm.com')
GRANITE_MODEL = os.environ.get('GRANITE_MODEL', 'ibm/granite-13b-instruct-v2')

# ───────────────────────────────────────────────────────────────
# DEMO DATA
# ───────────────────────────────────────────────────────────────

TEAMS = [
    {
        "id": "team_alpha", "name": "FC Alpha United", "shortName": "FCAU",
        "league": "Premier Analytics League", "manager": "Carlos Rivera",
        "formation": "4-3-3", "color": "#1e40af", "secondaryColor": "#93c5fd",
        "stats": {
            "wins": 14, "draws": 5, "losses": 4,
            "goalsScored": 48, "goalsConceded": 22,
            "possession": 58, "passAccuracy": 86,
            "shotsPerGame": 14.2, "shotsOnTarget": 6.8,
            "tacklesPerGame": 18.4, "interceptionsPerGame": 11.2,
            "form": ["W", "W", "D", "W", "L"]
        },
        "players": [
            {"id": "p1", "name": "Marco Santos", "position": "GK", "number": 1, "rating": 7.8, "goals": 0, "assists": 0, "age": 29, "nationality": "Brazil"},
            {"id": "p2", "name": "Luca Ferrari", "position": "CB", "number": 4, "rating": 7.9, "goals": 2, "assists": 1, "age": 27, "nationality": "Italy"},
            {"id": "p3", "name": "James Ward", "position": "CB", "number": 5, "rating": 7.6, "goals": 1, "assists": 2, "age": 31, "nationality": "England"},
            {"id": "p4", "name": "Kai Müller", "position": "LB", "number": 3, "rating": 7.5, "goals": 1, "assists": 5, "age": 24, "nationality": "Germany"},
            {"id": "p5", "name": "Roberto Dias", "position": "RB", "number": 2, "rating": 7.7, "goals": 2, "assists": 6, "age": 26, "nationality": "Portugal"},
            {"id": "p6", "name": "Yusuf Alkan", "position": "CM", "number": 6, "rating": 8.1, "goals": 4, "assists": 8, "age": 28, "nationality": "Turkey"},
            {"id": "p7", "name": "Emre Demir", "position": "CM", "number": 8, "rating": 8.3, "goals": 6, "assists": 10, "age": 25, "nationality": "Turkey"},
            {"id": "p8", "name": "Sofiane Amari", "position": "CM", "number": 10, "rating": 8.0, "goals": 5, "assists": 7, "age": 27, "nationality": "Algeria"},
            {"id": "p9", "name": "Pedro Alves", "position": "LW", "number": 11, "rating": 8.4, "goals": 12, "assists": 9, "age": 23, "nationality": "Brazil"},
            {"id": "p10", "name": "Hassan Omar", "position": "ST", "number": 9, "rating": 8.6, "goals": 18, "assists": 4, "age": 26, "nationality": "Egypt"},
            {"id": "p11", "name": "Viktor Novak", "position": "RW", "number": 7, "rating": 8.2, "goals": 8, "assists": 11, "age": 24, "nationality": "Czech Republic"}
        ]
    },
    {
        "id": "team_beta", "name": "Dynamo FC Beta", "shortName": "DFCB",
        "league": "Premier Analytics League", "manager": "Stefan Koch",
        "formation": "4-2-3-1", "color": "#dc2626", "secondaryColor": "#fca5a5",
        "stats": {
            "wins": 11, "draws": 7, "losses": 5,
            "goalsScored": 38, "goalsConceded": 28,
            "possession": 51, "passAccuracy": 82,
            "shotsPerGame": 12.4, "shotsOnTarget": 5.6,
            "tacklesPerGame": 20.1, "interceptionsPerGame": 13.4,
            "form": ["D", "W", "W", "D", "W"]
        },
        "players": [
            {"id": "p21", "name": "Anton Volkov", "position": "GK", "number": 1, "rating": 7.9, "goals": 0, "assists": 0, "age": 30, "nationality": "Russia"},
            {"id": "p22", "name": "Ben Clarke", "position": "CB", "number": 4, "rating": 7.5, "goals": 1, "assists": 0, "age": 28, "nationality": "England"},
            {"id": "p23", "name": "Diego Morales", "position": "CB", "number": 5, "rating": 7.4, "goals": 0, "assists": 1, "age": 32, "nationality": "Spain"},
            {"id": "p24", "name": "Jamal Osei", "position": "LB", "number": 3, "rating": 7.6, "goals": 0, "assists": 4, "age": 25, "nationality": "Ghana"},
            {"id": "p25", "name": "Nils Larsen", "position": "RB", "number": 2, "rating": 7.5, "goals": 1, "assists": 3, "age": 27, "nationality": "Denmark"},
            {"id": "p26", "name": "Fabio Costa", "position": "DM", "number": 6, "rating": 8.0, "goals": 2, "assists": 5, "age": 29, "nationality": "Brazil"},
            {"id": "p27", "name": "Artur Pena", "position": "DM", "number": 8, "rating": 7.9, "goals": 1, "assists": 6, "age": 26, "nationality": "Spain"},
            {"id": "p28", "name": "Liam O'Brien", "position": "AM", "number": 10, "rating": 8.2, "goals": 7, "assists": 9, "age": 24, "nationality": "Ireland"},
            {"id": "p29", "name": "Rashid Ali", "position": "LM", "number": 11, "rating": 7.8, "goals": 5, "assists": 6, "age": 23, "nationality": "Morocco"},
            {"id": "p30", "name": "Tomas Vidal", "position": "RM", "number": 7, "rating": 7.9, "goals": 6, "assists": 7, "age": 25, "nationality": "Chile"},
            {"id": "p31", "name": "Alexei Popov", "position": "ST", "number": 9, "rating": 8.5, "goals": 15, "assists": 3, "age": 27, "nationality": "Russia"}
        ]
    },
    {
        "id": "team_gamma", "name": "City Lions SC", "shortName": "CLSC",
        "league": "Premier Analytics League", "manager": "Antoine Dubois",
        "formation": "3-5-2", "color": "#16a34a", "secondaryColor": "#86efac",
        "stats": {
            "wins": 9, "draws": 8, "losses": 6,
            "goalsScored": 33, "goalsConceded": 31,
            "possession": 54, "passAccuracy": 83,
            "shotsPerGame": 11.8, "shotsOnTarget": 5.1,
            "tacklesPerGame": 19.2, "interceptionsPerGame": 12.8,
            "form": ["L", "W", "D", "W", "D"]
        },
        "players": [
            {"id": "p41", "name": "Olivier Blanc", "position": "GK", "number": 1, "rating": 7.7, "goals": 0, "assists": 0, "age": 28, "nationality": "France"},
            {"id": "p42", "name": "Marcus Brown", "position": "CB", "number": 5, "rating": 7.6, "goals": 2, "assists": 1, "age": 30, "nationality": "England"},
            {"id": "p43", "name": "Ivan Petrov", "position": "CB", "number": 4, "rating": 7.5, "goals": 1, "assists": 2, "age": 29, "nationality": "Bulgaria"},
            {"id": "p44", "name": "Kwame Asante", "position": "CB", "number": 6, "rating": 7.4, "goals": 0, "assists": 1, "age": 27, "nationality": "Ghana"},
            {"id": "p45", "name": "Lu Wei", "position": "RWB", "number": 2, "rating": 7.8, "goals": 2, "assists": 7, "age": 25, "nationality": "China"},
            {"id": "p46", "name": "Carlos Mendez", "position": "LWB", "number": 3, "rating": 7.7, "goals": 1, "assists": 6, "age": 26, "nationality": "Mexico"},
            {"id": "p47", "name": "Hamid Rahimi", "position": "CM", "number": 7, "rating": 7.9, "goals": 3, "assists": 4, "age": 28, "nationality": "Iran"},
            {"id": "p48", "name": "Sven Eriksson", "position": "CM", "number": 8, "rating": 8.0, "goals": 4, "assists": 5, "age": 27, "nationality": "Sweden"},
            {"id": "p49", "name": "João Lima", "position": "CM", "number": 10, "rating": 8.1, "goals": 5, "assists": 8, "age": 24, "nationality": "Portugal"},
            {"id": "p50", "name": "Adama Diallo", "position": "ST", "number": 9, "rating": 8.3, "goals": 13, "assists": 4, "age": 25, "nationality": "Senegal"},
            {"id": "p51", "name": "Nikola Jović", "position": "ST", "number": 11, "rating": 8.0, "goals": 10, "assists": 5, "age": 26, "nationality": "Serbia"}
        ]
    }
]

MATCHES = [
    {
        "id": "m1", "homeTeam": "team_alpha", "awayTeam": "team_beta",
        "homeScore": 3, "awayScore": 1, "date": "2024-11-10",
        "competition": "League", "round": 12,
        "homeFormation": "4-3-3", "awayFormation": "4-2-3-1",
        "homePossession": 58, "awayPossession": 42,
        "homeShots": 15, "awayShots": 9, "homeShotsOnTarget": 7, "awayShotsOnTarget": 4,
        "homePasses": 542, "awayPasses": 391, "homePassAccuracy": 87, "awayPassAccuracy": 80,
        "homeTackles": 18, "awayTackles": 22, "homeInterceptions": 11, "awayInterceptions": 14,
        "homeCorners": 7, "awayCorners": 3, "homeFouls": 10, "awayFouls": 15,
        "goals": [
            {"minute": 23, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Pedro Alves", "type": "open_play"},
            {"minute": 41, "team": "team_alpha", "scorer": "Emre Demir", "assist": "Viktor Novak", "type": "set_piece"},
            {"minute": 67, "team": "team_beta", "scorer": "Alexei Popov", "assist": "Liam O'Brien", "type": "counter"},
            {"minute": 84, "team": "team_alpha", "scorer": "Hassan Omar", "assist": None, "type": "penalty"}
        ],
        "keyMoments": ["Alpha dominated possession in first half", "Beta tried high press after 60min", "Alpha exploited space behind Beta's high line"],
        "xG": {"home": 2.8, "away": 1.1},
        "heatmap": {"homeAttack": "central_right", "awayAttack": "left_flank"}
    },
    {
        "id": "m2", "homeTeam": "team_gamma", "awayTeam": "team_alpha",
        "homeScore": 1, "awayScore": 2, "date": "2024-11-03",
        "competition": "League", "round": 11,
        "homeFormation": "3-5-2", "awayFormation": "4-3-3",
        "homePossession": 44, "awayPossession": 56,
        "homeShots": 10, "awayShots": 14, "homeShotsOnTarget": 4, "awayShotsOnTarget": 6,
        "homePasses": 408, "awayPasses": 519, "homePassAccuracy": 82, "awayPassAccuracy": 86,
        "homeTackles": 21, "awayTackles": 16, "homeInterceptions": 14, "awayInterceptions": 10,
        "homeCorners": 4, "awayCorners": 8, "homeFouls": 13, "awayFouls": 9,
        "goals": [
            {"minute": 15, "team": "team_alpha", "scorer": "Pedro Alves", "assist": "Kai Müller", "type": "open_play"},
            {"minute": 54, "team": "team_gamma", "scorer": "Adama Diallo", "assist": "João Lima", "type": "header"},
            {"minute": 78, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Emre Demir", "type": "counter"}
        ],
        "keyMoments": ["Alpha pressed effectively in first 20 mins", "Gamma equalized with aerial threat", "Alpha exploited wide channels in second half"],
        "xG": {"home": 1.4, "away": 2.2},
        "heatmap": {"homeAttack": "central", "awayAttack": "wide_channels"}
    },
    {
        "id": "m3", "homeTeam": "team_alpha", "awayTeam": "team_gamma",
        "homeScore": 2, "awayScore": 2, "date": "2024-10-26",
        "competition": "League", "round": 10,
        "homeFormation": "4-3-3", "awayFormation": "3-5-2",
        "homePossession": 57, "awayPossession": 43,
        "homeShots": 13, "awayShots": 11, "homeShotsOnTarget": 5, "awayShotsOnTarget": 5,
        "homePasses": 528, "awayPasses": 400, "homePassAccuracy": 85, "awayPassAccuracy": 81,
        "homeTackles": 17, "awayTackles": 20, "homeInterceptions": 10, "awayInterceptions": 13,
        "homeCorners": 6, "awayCorners": 5, "homeFouls": 11, "awayFouls": 12,
        "goals": [
            {"minute": 32, "team": "team_alpha", "scorer": "Viktor Novak", "assist": "Roberto Dias", "type": "open_play"},
            {"minute": 44, "team": "team_gamma", "scorer": "Nikola Jović", "assist": "Hamid Rahimi", "type": "set_piece"},
            {"minute": 59, "team": "team_alpha", "scorer": "Emre Demir", "assist": "Hassan Omar", "type": "open_play"},
            {"minute": 88, "team": "team_gamma", "scorer": "Adama Diallo", "assist": None, "type": "penalty"}
        ],
        "keyMoments": ["Late Gamma equalizer from penalty", "Alpha dominated central areas", "Gamma threat from set pieces throughout"],
        "xG": {"home": 2.1, "away": 1.8},
        "heatmap": {"homeAttack": "right_channel", "awayAttack": "set_pieces"}
    },
    {
        "id": "m4", "homeTeam": "team_beta", "awayTeam": "team_alpha",
        "homeScore": 1, "awayScore": 1, "date": "2024-10-19",
        "competition": "League", "round": 9,
        "homeFormation": "4-2-3-1", "awayFormation": "4-3-3",
        "homePossession": 46, "awayPossession": 54,
        "homeShots": 11, "awayShots": 13, "homeShotsOnTarget": 5, "awayShotsOnTarget": 6,
        "homePasses": 420, "awayPasses": 495, "homePassAccuracy": 83, "awayPassAccuracy": 85,
        "homeTackles": 23, "awayTackles": 17, "homeInterceptions": 15, "awayInterceptions": 11,
        "homeCorners": 4, "awayCorners": 7, "homeFouls": 14, "awayFouls": 10,
        "goals": [
            {"minute": 37, "team": "team_beta", "scorer": "Alexei Popov", "assist": "Liam O'Brien", "type": "open_play"},
            {"minute": 72, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Pedro Alves", "type": "open_play"}
        ],
        "keyMoments": ["Beta sat deep and hit on counter", "Alpha struggled to break compact Beta midfield", "Late Alpha equalizer from patient build-up"],
        "xG": {"home": 1.3, "away": 1.9},
        "heatmap": {"homeAttack": "counter_right", "awayAttack": "central_possession"}
    },
    {
        "id": "m5", "homeTeam": "team_alpha", "awayTeam": "team_gamma",
        "homeScore": 4, "awayScore": 0, "date": "2024-10-12",
        "competition": "Cup", "round": 4,
        "homeFormation": "4-3-3", "awayFormation": "3-5-2",
        "homePossession": 63, "awayPossession": 37,
        "homeShots": 18, "awayShots": 7, "homeShotsOnTarget": 9, "awayShotsOnTarget": 2,
        "homePasses": 589, "awayPasses": 342, "homePassAccuracy": 88, "awayPassAccuracy": 79,
        "homeTackles": 15, "awayTackles": 22, "homeInterceptions": 9, "awayInterceptions": 15,
        "homeCorners": 9, "awayCorners": 2, "homeFouls": 8, "awayFouls": 16,
        "goals": [
            {"minute": 12, "team": "team_alpha", "scorer": "Pedro Alves", "assist": "Emre Demir", "type": "open_play"},
            {"minute": 28, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Yusuf Alkan", "type": "open_play"},
            {"minute": 56, "team": "team_alpha", "scorer": "Viktor Novak", "assist": "Roberto Dias", "type": "open_play"},
            {"minute": 81, "team": "team_alpha", "scorer": "Sofiane Amari", "assist": "Hassan Omar", "type": "open_play"}
        ],
        "keyMoments": ["Dominant Alpha performance", "Gamma overloaded with Alpha's width", "Alpha's high press suffocated Gamma buildup"],
        "xG": {"home": 3.9, "away": 0.6},
        "heatmap": {"homeAttack": "wide_press", "awayAttack": "none"}
    },
    {
        "id": "m6", "homeTeam": "team_beta", "awayTeam": "team_gamma",
        "homeScore": 2, "awayScore": 1, "date": "2024-11-17",
        "competition": "League", "round": 13,
        "homeFormation": "4-2-3-1", "awayFormation": "3-5-2",
        "homePossession": 50, "awayPossession": 50,
        "homeShots": 13, "awayShots": 12, "homeShotsOnTarget": 6, "awayShotsOnTarget": 5,
        "homePasses": 462, "awayPasses": 459, "homePassAccuracy": 83, "awayPassAccuracy": 82,
        "homeTackles": 21, "awayTackles": 20, "homeInterceptions": 13, "awayInterceptions": 12,
        "homeCorners": 6, "awayCorners": 5, "homeFouls": 12, "awayFouls": 13,
        "goals": [
            {"minute": 29, "team": "team_beta", "scorer": "Liam O'Brien", "assist": "Fabio Costa", "type": "set_piece"},
            {"minute": 51, "team": "team_gamma", "scorer": "Adama Diallo", "assist": "João Lima", "type": "open_play"},
            {"minute": 74, "team": "team_beta", "scorer": "Alexei Popov", "assist": "Tomas Vidal", "type": "open_play"}
        ],
        "keyMoments": ["Beta physicality dominated midfield", "Gamma equalized with quick transitions", "Beta striker Popov proved decisive"],
        "xG": {"home": 2.0, "away": 1.5},
        "heatmap": {"homeAttack": "central_power", "awayAttack": "transitions"}
    },
    {
        "id": "m7", "homeTeam": "team_alpha", "awayTeam": "team_beta",
        "homeScore": 1, "awayScore": 2, "date": "2024-09-28",
        "competition": "League", "round": 7,
        "homeFormation": "4-3-3", "awayFormation": "4-2-3-1",
        "homePossession": 60, "awayPossession": 40,
        "homeShots": 16, "awayShots": 8, "homeShotsOnTarget": 5, "awayShotsOnTarget": 5,
        "homePasses": 557, "awayPasses": 371, "homePassAccuracy": 86, "awayPassAccuracy": 81,
        "homeTackles": 16, "awayTackles": 24, "homeInterceptions": 10, "awayInterceptions": 16,
        "homeCorners": 8, "awayCorners": 3, "homeFouls": 9, "awayFouls": 17,
        "goals": [
            {"minute": 18, "team": "team_alpha", "scorer": "Viktor Novak", "assist": "Emre Demir", "type": "open_play"},
            {"minute": 55, "team": "team_beta", "scorer": "Alexei Popov", "assist": "Liam O'Brien", "type": "counter"},
            {"minute": 87, "team": "team_beta", "scorer": "Rashid Ali", "assist": None, "type": "counter"}
        ],
        "keyMoments": ["Alpha dominated possession but struggled to convert", "Beta lethal on counter-attacks", "Alpha left too much space in behind"],
        "xG": {"home": 1.8, "away": 1.4},
        "heatmap": {"homeAttack": "possession_slow", "awayAttack": "fast_counter"}
    },
    {
        "id": "m8", "homeTeam": "team_gamma", "awayTeam": "team_beta",
        "homeScore": 0, "awayScore": 0, "date": "2024-09-21",
        "competition": "League", "round": 6,
        "homeFormation": "3-5-2", "awayFormation": "4-2-3-1",
        "homePossession": 52, "awayPossession": 48,
        "homeShots": 10, "awayShots": 11, "homeShotsOnTarget": 3, "awayShotsOnTarget": 4,
        "homePasses": 480, "awayPasses": 441, "homePassAccuracy": 83, "awayPassAccuracy": 82,
        "homeTackles": 22, "awayTackles": 21, "homeInterceptions": 14, "awayInterceptions": 13,
        "homeCorners": 5, "awayCorners": 6, "homeFouls": 14, "awayFouls": 13,
        "goals": [],
        "keyMoments": ["Tactical battle, both teams cancelled each other out", "Tight midfield duel", "Both goalkeepers had little to do"],
        "xG": {"home": 0.9, "away": 1.1},
        "heatmap": {"homeAttack": "controlled", "awayAttack": "controlled"}
    },
    {
        "id": "m9", "homeTeam": "team_alpha", "awayTeam": "team_alpha_ext1",
        "homeScore": 3, "awayScore": 0, "date": "2024-09-14",
        "competition": "League", "round": 5,
        "homeFormation": "4-3-3", "awayFormation": "5-3-2",
        "homePossession": 65, "awayPossession": 35,
        "homeShots": 17, "awayShots": 6, "homeShotsOnTarget": 8, "awayShotsOnTarget": 2,
        "homePasses": 601, "awayPasses": 322, "homePassAccuracy": 89, "awayPassAccuracy": 76,
        "homeTackles": 14, "awayTackles": 25, "homeInterceptions": 8, "awayInterceptions": 16,
        "homeCorners": 10, "awayCorners": 1, "homeFouls": 7, "awayFouls": 19,
        "goals": [
            {"minute": 8, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Pedro Alves", "type": "open_play"},
            {"minute": 44, "team": "team_alpha", "scorer": "Emre Demir", "assist": "Viktor Novak", "type": "set_piece"},
            {"minute": 70, "team": "team_alpha", "scorer": "Pedro Alves", "assist": "Kai Müller", "type": "open_play"}
        ],
        "keyMoments": ["Alpha relentlessly pressed high and broke compact 5-3-2", "Dominant width play from Alpha wings", "Opposition struggled to build from back"],
        "xG": {"home": 3.4, "away": 0.4},
        "heatmap": {"homeAttack": "high_press_width", "awayAttack": "defensive"}
    },
    {
        "id": "m10", "homeTeam": "team_beta", "awayTeam": "team_alpha",
        "homeScore": 2, "awayScore": 3, "date": "2024-08-31",
        "competition": "League", "round": 3,
        "homeFormation": "4-2-3-1", "awayFormation": "4-3-3",
        "homePossession": 43, "awayPossession": 57,
        "homeShots": 10, "awayShots": 15, "homeShotsOnTarget": 6, "awayShotsOnTarget": 8,
        "homePasses": 390, "awayPasses": 519, "homePassAccuracy": 80, "awayPassAccuracy": 86,
        "homeTackles": 24, "awayTackles": 17, "homeInterceptions": 16, "awayInterceptions": 11,
        "homeCorners": 4, "awayCorners": 7, "homeFouls": 15, "awayFouls": 10,
        "goals": [
            {"minute": 20, "team": "team_alpha", "scorer": "Viktor Novak", "assist": "Emre Demir", "type": "open_play"},
            {"minute": 34, "team": "team_beta", "scorer": "Liam O'Brien", "assist": "Fabio Costa", "type": "open_play"},
            {"minute": 50, "team": "team_alpha", "scorer": "Hassan Omar", "assist": "Yusuf Alkan", "type": "open_play"},
            {"minute": 65, "team": "team_beta", "scorer": "Alexei Popov", "assist": "Tomas Vidal", "type": "open_play"},
            {"minute": 83, "team": "team_alpha", "scorer": "Pedro Alves", "assist": None, "type": "open_play"}
        ],
        "keyMoments": ["End-to-end thriller", "Alpha's late winner proved quality of their attack", "Beta dangerous from wide areas"],
        "xG": {"home": 1.9, "away": 2.7},
        "heatmap": {"homeAttack": "wide_counters", "awayAttack": "central_dominance"}
    }
]

TACTICAL_PATTERNS = {
    "team_alpha": {
        "preferredFormations": ["4-3-3", "4-2-3-1"],
        "attackStyle": "possession_based",
        "defendingStyle": "high_press",
        "buildupPlay": "short_passing",
        "pressingTriggers": ["goalkeeper_ball", "back_pass", "poor_touch"],
        "weaknesses": ["vulnerable_behind_high_line", "exposed_on_counters", "right_flank_less_active"],
        "strengths": ["central_midfield_dominance", "wide_attack_variety", "set_piece_threat", "clinical_striker"],
        "patterns": {
            "attacking": "Alpha builds through the midfield triangle, using the CM depth. Quick switches to wide forwards who cut inside. Striker drops deep to create space.",
            "defending": "High defensive line with aggressive pressing from forwards. Compact 4-3 shape in midfield when defending deep. Right-back pushes high creating overlap.",
            "transitions": "Quick vertical passes when winning possession. Central midfielder drives forward. Wingers stay wide to stretch defense."
        }
    },
    "team_beta": {
        "preferredFormations": ["4-2-3-1", "4-4-2"],
        "attackStyle": "counter_attack",
        "defendingStyle": "mid_block",
        "buildupPlay": "direct_play",
        "pressingTriggers": ["loose_ball", "opponent_goalkeeper", "midfield_error"],
        "weaknesses": ["slow_build_from_back", "vulnerable_to_pressing", "right_back_pace_issue", "limited_width"],
        "strengths": ["physical_midfield", "striker_quality", "set_piece_defending", "organized_shape"],
        "patterns": {
            "attacking": "Beta allows opponent to have ball then springs with quick vertical passes to striker Popov. Number 10 O'Brien links play. Wide midfielders support late.",
            "defending": "Deep mid-block in 4-2-3-1. Double pivot shields back four. Forces play wide then squeezes. Limited pressing triggers in own half.",
            "transitions": "Direct long balls to striker or wide runners on counter. Quickly bypasses midfield. Number 10 makes late runs to support."
        }
    },
    "team_gamma": {
        "preferredFormations": ["3-5-2", "5-3-2"],
        "attackStyle": "structured_build",
        "defendingStyle": "medium_block",
        "buildupPlay": "three_at_the_back_buildup",
        "pressingTriggers": ["back_three_error", "long_ball_clearance"],
        "weaknesses": ["wide_spaces_behind_wing_backs", "aerial_vulnerability_in_3CB", "slow_in_transition", "right_wing_back_coverage"],
        "strengths": ["aerial_duels", "set_pieces_defending", "two_striker_combination", "wing_back_overlaps"],
        "patterns": {
            "attacking": "Gamma uses wing-backs as primary width creators. Two strikers combination play to hold up and link. Midfield three advances from box-to-box.",
            "defending": "Three CBs absorb crosses and long balls. Wing-backs track back to form 5. Central midfielder screens. Vulnerable to quick switches behind wing-backs.",
            "transitions": "Relies on strikers holding the ball. Wing-backs advance quickly when winning. Can leave large gaps when both advance."
        }
    }
}

FORMATIONS = {
    "4-3-3": {
        "name": "4-3-3",
        "positions": [
            {"x": 50, "y": 92, "label": "GK", "role": "Goalkeeper"},
            {"x": 15, "y": 72, "label": "LB", "role": "Left Back"},
            {"x": 35, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 65, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 85, "y": 72, "label": "RB", "role": "Right Back"},
            {"x": 25, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 50, "y": 48, "label": "CM", "role": "Central Midfielder"},
            {"x": 75, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 15, "y": 25, "label": "LW", "role": "Left Winger"},
            {"x": 50, "y": 20, "label": "ST", "role": "Striker"},
            {"x": 85, "y": 25, "label": "RW", "role": "Right Winger"}
        ]
    },
    "4-2-3-1": {
        "name": "4-2-3-1",
        "positions": [
            {"x": 50, "y": 92, "label": "GK", "role": "Goalkeeper"},
            {"x": 15, "y": 72, "label": "LB", "role": "Left Back"},
            {"x": 35, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 65, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 85, "y": 72, "label": "RB", "role": "Right Back"},
            {"x": 35, "y": 56, "label": "DM", "role": "Defensive Midfielder"},
            {"x": 65, "y": 56, "label": "DM", "role": "Defensive Midfielder"},
            {"x": 15, "y": 38, "label": "LM", "role": "Left Midfielder"},
            {"x": 50, "y": 36, "label": "AM", "role": "Attacking Midfielder"},
            {"x": 85, "y": 38, "label": "RM", "role": "Right Midfielder"},
            {"x": 50, "y": 18, "label": "ST", "role": "Striker"}
        ]
    },
    "3-5-2": {
        "name": "3-5-2",
        "positions": [
            {"x": 50, "y": 92, "label": "GK", "role": "Goalkeeper"},
            {"x": 25, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 50, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 75, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 10, "y": 52, "label": "LWB", "role": "Left Wing Back"},
            {"x": 30, "y": 52, "label": "CM", "role": "Central Midfielder"},
            {"x": 50, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 70, "y": 52, "label": "CM", "role": "Central Midfielder"},
            {"x": 90, "y": 52, "label": "RWB", "role": "Right Wing Back"},
            {"x": 35, "y": 22, "label": "ST", "role": "Striker"},
            {"x": 65, "y": 22, "label": "ST", "role": "Striker"}
        ]
    },
    "4-4-2": {
        "name": "4-4-2",
        "positions": [
            {"x": 50, "y": 92, "label": "GK", "role": "Goalkeeper"},
            {"x": 15, "y": 72, "label": "LB", "role": "Left Back"},
            {"x": 35, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 65, "y": 72, "label": "CB", "role": "Center Back"},
            {"x": 85, "y": 72, "label": "RB", "role": "Right Back"},
            {"x": 15, "y": 50, "label": "LM", "role": "Left Midfielder"},
            {"x": 38, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 62, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 85, "y": 50, "label": "RM", "role": "Right Midfielder"},
            {"x": 35, "y": 24, "label": "ST", "role": "Striker"},
            {"x": 65, "y": 24, "label": "ST", "role": "Striker"}
        ]
    },
    "5-3-2": {
        "name": "5-3-2",
        "positions": [
            {"x": 50, "y": 92, "label": "GK", "role": "Goalkeeper"},
            {"x": 10, "y": 70, "label": "LWB", "role": "Left Wing Back"},
            {"x": 28, "y": 74, "label": "CB", "role": "Center Back"},
            {"x": 50, "y": 76, "label": "CB", "role": "Center Back"},
            {"x": 72, "y": 74, "label": "CB", "role": "Center Back"},
            {"x": 90, "y": 70, "label": "RWB", "role": "Right Wing Back"},
            {"x": 28, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 50, "y": 48, "label": "CM", "role": "Central Midfielder"},
            {"x": 72, "y": 50, "label": "CM", "role": "Central Midfielder"},
            {"x": 35, "y": 24, "label": "ST", "role": "Striker"},
            {"x": 65, "y": 24, "label": "ST", "role": "Striker"}
        ]
    }
}

# ───────────────────────────────────────────────────────────────
# RAG ENGINE
# ───────────────────────────────────────────────────────────────

class RAGEngine:
    def __init__(self):
        self.documents = []
        self.index = {}

    def initialize(self):
        self.documents = []
        for m in MATCHES:
            home = next((t for t in TEAMS if t["id"] == m["homeTeam"]), None)
            away = next((t for t in TEAMS if t["id"] == m["awayTeam"]), None)
            home_name = home["name"] if home else m["homeTeam"]
            away_name = away["name"] if away else m["awayTeam"]
            goals_text = ", ".join([f"{g['minute']}' {g['scorer']} ({g['type']})" for g in m.get("goals", [])])
            content = (f"Match: {home_name} vs {away_name} on {m['date']}. "
                      f"Score: {m['homeScore']}-{m['awayScore']}. "
                      f"Formation: {m['homeFormation']} vs {m['awayFormation']}. "
                      f"Possession: {m['homePossession']}% vs {m['awayPossession']}%. "
                      f"Key moments: {'. '.join(m.get('keyMoments', []))}. "
                      f"Goals: {goals_text}.")
            self.documents.append({
                "id": m["id"], "type": "match_result",
                "content": content,
                "metadata": {"homeTeam": m["homeTeam"], "awayTeam": m["awayTeam"]},
                "match": m
            })

        for team_id, tactics in TACTICAL_PATTERNS.items():
            team = next((t for t in TEAMS if t["id"] == team_id), None)
            content = (f"Team: {team['name'] if team else team_id}. "
                      f"Formations: {', '.join(tactics['preferredFormations'])}. "
                      f"Attack: {tactics['attackStyle']}. Defense: {tactics['defendingStyle']}. "
                      f"Weaknesses: {', '.join(tactics['weaknesses'])}. "
                      f"Strengths: {', '.join(tactics['strengths'])}. "
                      f"Patterns: {tactics['patterns']['attacking']} {tactics['patterns']['defending']}")
            self.documents.append({
                "id": f"tactics_{team_id}", "type": "tactical_analysis",
                "content": content,
                "metadata": {"teamId": team_id},
                "tactics": tactics
            })

        for team in TEAMS:
            for p in team.get("players", []):
                content = (f"Player: {p['name']}. Team: {team['name']}. Position: {p['position']}. "
                          f"Rating: {p['rating']}. Goals: {p['goals']}. Assists: {p['assists']}.")
                self.documents.append({
                    "id": f"player_{p['id']}", "type": "player_stats",
                    "content": content,
                    "metadata": {"teamId": team["id"], "playerId": p["id"]},
                    "player": p
                })
        self._build_index()

    def _tokenize(self, text):
        stop = {"the","and","for","with","this","that","are","was","has","have","from","they"}
        tokens = re.sub(r'[^\w\s]', ' ', text.lower()).split()
        return [t for t in tokens if len(t) > 2 and t not in stop]

    def _build_index(self):
        self.index = {}
        for i, doc in enumerate(self.documents):
            for token in self._tokenize(doc["content"]):
                if token not in self.index:
                    self.index[token] = []
                self.index[token].append(i)

    def _tfidf(self, query, doc):
        q_tokens = self._tokenize(query)
        d_tokens = self._tokenize(doc["content"])
        doc_len = len(d_tokens) or 1
        score = 0
        for qt in q_tokens:
            tf = d_tokens.count(qt) / doc_len
            idf = math.log(len(self.documents) / max(len(self.index.get(qt, [1])), 1))
            score += tf * idf
        return score

    def retrieve(self, query, top_k=5, filter_team=None, filter_type=None):
        candidates = self.documents
        if filter_team:
            candidates = [d for d in candidates if
                d.get("metadata", {}).get("teamId") == filter_team or
                d.get("metadata", {}).get("homeTeam") == filter_team or
                d.get("metadata", {}).get("awayTeam") == filter_team]
        if filter_type:
            candidates = [d for d in candidates if d["type"] == filter_type]
        scored = sorted(candidates, key=lambda d: self._tfidf(query, d), reverse=True)
        return scored[:top_k]

    def ingest(self, records):
        for i, row in enumerate(records):
            content = ". ".join(f"{k}: {v}" for k, v in row.items())
            self.documents.append({
                "id": f"custom_{i}", "type": "custom_match",
                "content": content, "metadata": {"source": "user_upload"}
            })
        self._build_index()
        return len(records)

rag = RAGEngine()
rag.initialize()

# ───────────────────────────────────────────────────────────────
# IBM GRANITE CLIENT
# ───────────────────────────────────────────────────────────────

_iam_token = None
_token_expiry = 0

def get_iam_token():
    import requests, time
    global _iam_token, _token_expiry
    if _iam_token and time.time() < _token_expiry:
        return _iam_token
    r = requests.post("https://iam.cloud.ibm.com/identity/token",
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": IBM_API_KEY},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    data = r.json()
    _iam_token = data.get("access_token")
    _token_expiry = time.time() + data.get("expires_in", 3600) - 60
    return _iam_token

def call_granite(prompt, max_tokens=800):
    if not IBM_API_KEY or not IBM_PROJECT_ID:
        return None
    try:
        import requests
        token = get_iam_token()
        r = requests.post(
            f"{IBM_ENDPOINT}/ml/v1/text/generation?version=2023-05-29",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
            json={
                "model_id": GRANITE_MODEL,
                "input": prompt,
                "parameters": {
                    "decoding_method": "greedy",
                    "max_new_tokens": max_tokens,
                    "stop_sequences": ["###"],
                    "repetition_penalty": 1.1
                },
                "project_id": IBM_PROJECT_ID
            }, timeout=30)
        if r.ok:
            return r.json().get("results", [{}])[0].get("generated_text")
    except Exception as e:
        print(f"[Granite] Error: {e}")
    return None

def is_granite_available():
    return bool(IBM_API_KEY and IBM_PROJECT_ID)

# ───────────────────────────────────────────────────────────────
# FALLBACK REASONING ENGINE
# ───────────────────────────────────────────────────────────────

WEAKNESS_DESCRIPTIONS = {
    "vulnerable_behind_high_line": "Target space behind defensive line with quick through-balls",
    "right_flank_less_active": "Overload left side of their attack — attack right back aggressively",
    "slow_build_from_back": "Apply high press on goalkeeper and CBs immediately",
    "vulnerable_to_pressing": "Press in teams of 3 from front — force errors",
    "right_back_pace_issue": "Attack channel behind slow right back with fastest winger",
    "limited_width": "Stretch play wide, force their central block to expand",
    "wide_spaces_behind_wing_backs": "Early balls behind advancing wing-backs — timing is key",
    "slow_in_transition": "Counter-attack immediately at high speed on turnover",
    "aerial_vulnerability_in_3CB": "Deliver crosses to target man — aerial threat",
    "right_wing_back_coverage": "Overload left side early to exploit coverage gap"
}

STRENGTH_DESCRIPTIONS = {
    "central_midfield_dominance": {"label": "Central Midfield Control", "severity": "danger", "howToCounter": "Use wide overloads to bypass midfield"},
    "wide_attack_variety": {"label": "Wide Attack Variety", "severity": "warning", "howToCounter": "Narrow shape, reduce wing space"},
    "set_piece_threat": {"label": "Set Piece Danger", "severity": "danger", "howToCounter": "Zonal defending on corners, man-mark key headers"},
    "clinical_striker": {"label": "Clinical Striker", "severity": "danger", "howToCounter": "Deny space, double team striker"},
    "physical_midfield": {"label": "Physical Midfield", "severity": "warning", "howToCounter": "Use quick 1-2s to bypass physicality"},
    "striker_quality": {"label": "Elite Striker Quality", "severity": "danger", "howToCounter": "Restrict supply to striker, offside trap"},
    "set_piece_defending": {"label": "Strong Set Piece Defense", "severity": "info", "howToCounter": "Focus on open play combinations"},
    "organized_shape": {"label": "Well-Organized Shape", "severity": "warning", "howToCounter": "Patient possession to disorganize them"},
    "aerial_duels": {"label": "Aerial Dominance", "severity": "warning", "howToCounter": "Play low and wide, avoid high balls"},
    "wing_back_overlaps": {"label": "Dangerous Overlaps", "severity": "warning", "howToCounter": "Narrow shape, block overlap channels"},
    "two_striker_combination": {"label": "Two-Striker Combination", "severity": "danger", "howToCounter": "Two CBs stay tight, midfielder screens"}
}

def generate_match_analysis(team, team_matches):
    wins = sum(1 for m in team_matches if (m["homeTeam"] == team["id"] and m["homeScore"] > m["awayScore"]) or (m["awayTeam"] == team["id"] and m["awayScore"] > m["homeScore"]))
    losses = sum(1 for m in team_matches if (m["homeTeam"] == team["id"] and m["homeScore"] < m["awayScore"]) or (m["awayTeam"] == team["id"] and m["awayScore"] < m["homeScore"]))
    draws = len(team_matches) - wins - losses
    n = len(team_matches) or 1
    avg_poss = sum(m["homePossession"] if m["homeTeam"] == team["id"] else m["awayPossession"] for m in team_matches) / n
    avg_shots = sum(m["homeShots"] if m["homeTeam"] == team["id"] else m["awayShots"] for m in team_matches) / n
    total_goals = sum(m["homeScore"] if m["homeTeam"] == team["id"] else m["awayScore"] for m in team_matches)
    formation_counts = {}
    for m in team_matches:
        f = m["homeFormation"] if m["homeTeam"] == team["id"] else m["awayFormation"]
        formation_counts[f] = formation_counts.get(f, 0) + 1
    top_formation = max(formation_counts, key=formation_counts.get) if formation_counts else team["formation"]
    return {
        "text": (f"Analysis of {team['name']} across {len(team_matches)} recent matches reveals a {wins}W/{draws}D/{losses}L record. "
                f"Average possession: {avg_poss:.1f}% — {'possession-dominant' if avg_poss > 52 else 'direct, counter-oriented'} style. "
                f"They average {avg_shots:.1f} shots per game, scoring {total_goals} total goals. "
                f"Most-used formation: {top_formation}. "
                f"Pass accuracy of {team['stats']['passAccuracy']}% puts them in the {'top tier' if team['stats']['passAccuracy'] > 84 else 'mid-range'} of the league."),
        "confidence": 0.82,
        "dataSource": "rule_based_fallback",
        "metrics": {"wins": wins, "draws": draws, "losses": losses, "avgPossession": round(avg_poss, 1), "avgShots": round(avg_shots, 1), "totalGoals": total_goals, "topFormation": top_formation}
    }

def generate_opponent_analysis(opponent, tactics):
    weaknesses = [{"label": WEAKNESS_DESCRIPTIONS.get(w, w.replace("_", " ")), "severity": "high", "zone": "general", "howToExploit": WEAKNESS_DESCRIPTIONS.get(w, w.replace("_"," "))} for w in (tactics.get("weaknesses") or [])]
    strengths = [STRENGTH_DESCRIPTIONS.get(s, {"label": s.replace("_", " "), "severity": "warning", "howToCounter": "Contain with organized defending"}) for s in (tactics.get("strengths") or [])]
    return {
        "text": (f"{opponent['name']}'s tactical profile: {'/'.join(tactics.get('preferredFormations', []))} formation. "
                f"Attack style: {tactics.get('attackStyle', 'unknown').replace('_', ' ')}. "
                f"Key weaknesses: {', '.join([w['label'] for w in weaknesses[:2]])}. "
                f"Key strengths to neutralize: {', '.join([s['label'] for s in strengths[:2]])}. "
                f"Defensive style: {tactics.get('defendingStyle', 'medium_block').replace('_', ' ')}."),
        "confidence": 0.85, "dataSource": "rule_based_fallback",
        "weaknesses": weaknesses, "strengths": strengths
    }

def generate_strategy(team, opponent, team_tactics, opp_tactics):
    formation = "4-3-3"
    reasoning = []
    if opp_tactics:
        if opp_tactics.get("attackStyle") == "counter_attack":
            formation = "4-2-3-1"
            reasoning.append("Double pivot shields against counter-attacks")
        elif "3-5-2" in opp_tactics.get("preferredFormations", []):
            formation = "4-3-3"
            reasoning.append("4-3-3 creates overload against 3-5-2 in wide areas")
        elif "wide_spaces_behind_wing_backs" in opp_tactics.get("weaknesses", []):
            formation = "4-3-3"
            reasoning.append("Wingers exploit spaces behind advancing wing-backs")
    alt = {"4-3-3": "4-2-3-1", "4-2-3-1": "4-3-3", "3-5-2": "4-3-3"}.get(formation, "4-2-3-1")
    weaknesses = opp_tactics.get("weaknesses", []) if opp_tactics else []
    attack_plan = ""
    if "vulnerable_behind_high_line" in weaknesses:
        attack_plan = "Deploy rapid through-ball transitions targeting space behind their high line."
    elif "slow_build_from_back" in weaknesses:
        attack_plan = "Apply high press from front three. Force goalkeeper and CBs into errors."
    else:
        attack_plan = "Patient possession through midfield, create overloads on weaker flank."
    defense_plan = "Maintain compact mid-block. Press at designated triggers. 6-second transition rule."
    if opp_tactics and opp_tactics.get("attackStyle") == "counter_attack":
        defense_plan = "No simultaneous full-back advances. Double pivot screens back line at all times."
    return {
        "text": f"FORMATION: {formation}. {'. '.join(reasoning)}. ATTACK: {attack_plan} DEFENSE: {defense_plan}",
        "recommendedFormation": formation, "alternativeFormation": alt,
        "attackPlan": attack_plan, "defensePlan": defense_plan, "reasoning": reasoning,
        "confidence": 0.88, "dataSource": "rule_based_fallback"
    }

def generate_live_advice(ctx):
    score = ctx.get("score", "0-0")
    minute = int(ctx.get("minute", 45))
    possession = int(ctx.get("possession", 50))
    notes = ctx.get("notes", "")
    fatigue = ctx.get("fatigue", False)
    opp_formation = ctx.get("opponentFormation", "4-4-2")
    team_formation = ctx.get("teamFormation", "4-3-3")
    
    parts = score.split("-")
    our = int(parts[0]) if parts[0].isdigit() else 0
    their = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    
    is_winning = our > their
    is_losing = our < their
    is_late = minute > 70
    is_mid = 45 < minute <= 70
    
    advice = []
    urgency = "normal"
    
    if is_winning and is_late:
        advice = ["Protect the lead: drop to compact 4-5-1 shape, reduce pressing risk", "Use time intelligently — slow the game when in possession", "No unnecessary risks in own half — clear long when under pressure"]
        urgency = "low"
    elif is_losing and is_late:
        advice = [f"URGENT: Push higher, switch to attacking shape — you need a goal now", "Bring fresh attackers, overload penalty area on set pieces", f"Attack spaces behind their {opp_formation} — move the ball with pace"]
        urgency = "high"
    elif is_losing and is_mid:
        advice = [f"Change from {team_formation} to 4-3-3 for more attacking presence", "Increase tempo — shorter passes, quick combinations in tight spaces", "Push full-backs higher to create width and stretch their block"]
        urgency = "elevated"
    elif our == their and is_late:
        advice = ["Push for the win: advanced full-backs, more runners from midfield", "Use width — attack the channels behind their tired full-backs", "Bring on fresh striker if available — goal could win this"]
        urgency = "elevated"
    else:
        advice = ["Maintain current tactical structure — the game plan is working", "Monitor midfield fatigue — consider a fresh runner in next 15 minutes", "Keep pressing triggers consistent — shape discipline is key"]
    
    if possession < 40:
        advice.append("Low possession warning: press the ball carrier harder to regain midfield control")
    if fatigue:
        advice.append("Fatigue detected: rotate pressing duties — not all forwards press simultaneously")
    if notes:
        advice.append(f"Tactical observation: {notes[:100]} — adapt positioning accordingly")
    
    return {"text": " | ".join(advice), "advice": advice, "urgency": urgency, "confidence": 0.87, "dataSource": "live_context_analysis"}

def generate_chat_response(question, team, opponent, rag_context):
    q = question.lower()
    opp_tactics = TACTICAL_PATTERNS.get(opponent["id"]) if opponent else None
    
    if any(w in q for w in ["formation", "setup"]):
        answer = (f"Based on {team['name']}'s recent performance and {opponent['name'] if opponent else 'opponent'}'s patterns, "
                 f"the recommended formation is {team['formation']}. This leverages your "
                 f"{'possession and central midfield control' if team['stats']['possession'] > 55 else 'quick transitions and direct play'}.")
    elif "weakness" in q or "vulnerab" in q:
        weaknesses = opp_tactics.get("weaknesses", []) if opp_tactics else []
        answer = f"Key weaknesses identified: {', '.join([w.replace('_', ' ') for w in weaknesses[:3]])}." if weaknesses else "Limited weakness data available — analyze more matches."
    elif "losing" in q or "behind" in q:
        answer = "If you're losing: switch to more attacking shape, push full-backs higher, increase tempo and pressing intensity. Target opponent's weaker areas immediately."
    elif "defend" in q:
        opp_attack = opp_tactics.get("attackStyle", "unknown") if opp_tactics else "unknown"
        answer = f"Against {'counter-attack' if opp_attack == 'counter_attack' else 'their'} style: set up compact mid-block, double pivot in midfield, restrict space behind your line."
    elif any(w in q for w in ["player", "perform", "rating"]):
        top = sorted(team.get("players", []), key=lambda p: p["rating"], reverse=True)[0] if team.get("players") else None
        answer = f"Top performer: {top['name']} ({top['position']}) — rating {top['rating']}, {top['goals']} goals, {top['assists']} assists." if top else "Player data being analyzed."
    elif "second half" in q or "halftime" in q:
        answer = "At halftime: check press effectiveness, make 1-2 targeted substitutions, adjust wide coverage. Key change should exploit fatigue in opponent's flank."
    else:
        ctx_text = " ".join([d["content"][:200] for d in rag_context[:2]])
        answer = f"Based on match data: {ctx_text[:300]}. Focus on {team['name']}'s proven strengths while targeting identified vulnerabilities."
    
    return {"text": answer, "confidence": 0.78, "dataSource": "rag_augmented_analysis", "agentPipeline": ["Match Analysis", "Opponent Scout", "Strategy", "Explanation"]}

# ───────────────────────────────────────────────────────────────
# FULL PIPELINE
# ───────────────────────────────────────────────────────────────

def build_opponent_analysis(opponent_id):
    opponent = next((t for t in TEAMS if t["id"] == opponent_id), None)
    if not opponent:
        return None
    tactics = TACTICAL_PATTERNS.get(opponent_id, {})
    opp_matches = [m for m in MATCHES if m["homeTeam"] == opponent_id or m["awayTeam"] == opponent_id]

    granite_result = call_granite(f"Scout {opponent['name']}. Formation: {tactics.get('preferredFormations', [])}. Weaknesses: {tactics.get('weaknesses', [])}. Provide tactical analysis:", 500)
    if granite_result:
        analysis = {"text": granite_result, "confidence": 0.91, "dataSource": "ibm_granite"}
    else:
        analysis = generate_opponent_analysis(opponent, tactics)

    weaknesses = [{
        "label": WEAKNESS_DESCRIPTIONS.get(w, w.replace("_", " ")),
        "severity": "critical" if w in ["vulnerable_behind_high_line", "vulnerable_to_pressing", "wide_spaces_behind_wing_backs"] else "high",
        "zone": "general",
        "howToExploit": WEAKNESS_DESCRIPTIONS.get(w, w.replace("_", " "))
    } for w in tactics.get("weaknesses", [])]

    strengths = [STRENGTH_DESCRIPTIONS.get(s, {"label": s.replace("_", " "), "severity": "warning", "howToCounter": "Contain with organized defending"}) for s in tactics.get("strengths", [])]

    attack_patterns = []
    if tactics.get("attackStyle") == "counter_attack":
        attack_patterns.append({"type": "counter_attack", "severity": "high", "description": "Quick vertical passes to striker, bypasses midfield"})
    if "wide_spaces_behind_wing_backs" in tactics.get("weaknesses", []):
        attack_patterns.append({"type": "wing_attack", "severity": "high", "description": "Wing-backs push high aggressively"})

    defense_styles = {
        "high_press": {"style": "High Press", "lineHeight": "High", "compactness": "Medium", "description": "Aggressive pressing high up the pitch", "pressTriggers": tactics.get("pressingTriggers", [])},
        "mid_block": {"style": "Mid Block", "lineHeight": "Medium", "compactness": "High", "description": "Disciplined mid-block, force play wide", "pressTriggers": tactics.get("pressingTriggers", [])},
        "medium_block": {"style": "Medium Block", "lineHeight": "Medium", "compactness": "Medium", "description": "Balanced shape", "pressTriggers": tactics.get("pressingTriggers", [])}
    }
    defensive_patterns = defense_styles.get(tactics.get("defendingStyle", "medium_block"), defense_styles["medium_block"])

    recent_form = []
    for m in opp_matches[:5]:
        is_home = m["homeTeam"] == opponent_id
        my = m["homeScore"] if is_home else m["awayScore"]
        their = m["awayScore"] if is_home else m["homeScore"]
        recent_form.append({"date": m["date"], "result": "W" if my > their else ("D" if my == their else "L"), "score": f"{my}-{their}", "possession": m["homePossession"] if is_home else m["awayPossession"]})

    vulnerable_zones = []
    if "vulnerable_behind_high_line" in tactics.get("weaknesses", []):
        vulnerable_zones.append({"zone": "Behind Defensive Line", "x": 50, "y": 15, "threat": "critical", "description": "Space behind high defensive line"})
    if "right_back_pace_issue" in tactics.get("weaknesses", []) or "right_flank_less_active" in tactics.get("weaknesses", []):
        vulnerable_zones.append({"zone": "Right Flank", "x": 85, "y": 40, "threat": "high", "description": "Weak right-side coverage"})
    if "wide_spaces_behind_wing_backs" in tactics.get("weaknesses", []):
        vulnerable_zones.append({"zone": "Behind Wing-Backs", "x": 15, "y": 25, "threat": "critical", "description": "Space when wing-backs advance"})

    player_threats = [dict(p, **{"threatLevel": "critical" if p["rating"] >= 8.4 else "high", "tacticToNeutralize": "Double-mark, restrict supply" if p["position"] == "ST" else "Man-mark in midfield"}) for p in sorted(opponent.get("players", []), key=lambda p: p["rating"], reverse=True) if p["rating"] >= 8.0]

    return {
        "agent": "Opponent Strategy Agent",
        "opponentId": opponent_id,
        "opponent": opponent,
        "analysis": analysis,
        "tactics": tactics,
        "formations": {"primary": tactics.get("preferredFormations", ["4-4-2"])[0], "secondary": tactics.get("preferredFormations", ["4-4-2", "4-3-3"])[1] if len(tactics.get("preferredFormations", [])) > 1 else None, "pattern": tactics.get("patterns", {}).get("attacking", "")},
        "attackPatterns": attack_patterns,
        "defensivePatterns": defensive_patterns,
        "weaknessMap": weaknesses,
        "strengthMap": strengths,
        "recentForm": recent_form,
        "vulnerableZones": vulnerable_zones,
        "playerThreats": player_threats,
        "pressureAnalysis": {"pressing_intensity": {"high_press": "Very High", "mid_block": "Medium", "medium_block": "Low-Medium"}.get(tactics.get("defendingStyle", "medium_block"), "Medium")},
        "ragContext": rag.retrieve(f"{opponent['name']} tactics formations", top_k=3),
        "timestamp": datetime.utcnow().isoformat()
    }

def run_full_pipeline(team_id, opponent_id):
    team = next((t for t in TEAMS if t["id"] == team_id), None)
    opponent = next((t for t in TEAMS if t["id"] == opponent_id), None)
    if not team or not opponent:
        raise ValueError(f"Team {team_id} or opponent {opponent_id} not found")

    team_tactics = TACTICAL_PATTERNS.get(team_id, {})
    opp_tactics = TACTICAL_PATTERNS.get(opponent_id, {})
    team_matches = [m for m in MATCHES if m["homeTeam"] == team_id or m["awayTeam"] == team_id]

    # Match analysis
    granite_text = call_granite(f"Analyze {team['name']}: {team['stats']['wins']}W/{team['stats']['draws']}D/{team['stats']['losses']}L. Formation: {team['formation']}. Provide tactical insights:", 500)
    match_analysis_text = {"text": granite_text, "confidence": 0.92, "dataSource": "ibm_granite"} if granite_text else generate_match_analysis(team, team_matches)

    formation_history = {}
    for m in team_matches:
        f = m["homeFormation"] if m["homeTeam"] == team_id else m["awayFormation"]
        formation_history[f] = formation_history.get(f, 0) + 1
    formation_history = [{"formation": f, "count": c, "percentage": round(c/len(team_matches)*100)} for f, c in formation_history.items()]

    performance_trend = []
    for m in reversed(team_matches[:8]):
        is_home = m["homeTeam"] == team_id
        my_goals = m["homeScore"] if is_home else m["awayScore"]
        their_goals = m["awayScore"] if is_home else m["homeScore"]
        performance_trend.append({
            "date": m["date"][5:], "goalsFor": my_goals, "goalsAgainst": their_goals,
            "result": "W" if my_goals > their_goals else ("D" if my_goals == their_goals else "L"),
            "possession": m["homePossession"] if is_home else m["awayPossession"],
            "shots": m["homeShots"] if is_home else m["awayShots"]
        })

    match_analysis = {
        "agent": "Match Analysis Agent", "teamId": team_id, "team": team,
        "analysis": match_analysis_text, "formationHistory": formation_history,
        "performanceTrend": performance_trend,
        "playerInsights": sorted([dict(p, **{"performance": "excellent" if p["rating"] >= 8.3 else "good", "isKeyPlayer": p["rating"] >= 8.3}) for p in team.get("players", [])], key=lambda x: x["rating"], reverse=True),
        "ragDocuments": len(rag.retrieve(f"{team['name']}", top_k=3)),
        "stats": team["stats"]
    }

    # Opponent analysis
    opponent_analysis = build_opponent_analysis(opponent_id)

    # Strategy
    strat = generate_strategy(team, opponent, team_tactics, opp_tactics)
    formation = strat["recommendedFormation"]
    alt_formation = strat["alternativeFormation"]

    attack_priorities = []
    weaknesses = opp_tactics.get("weaknesses", [])
    if "vulnerable_behind_high_line" in weaknesses:
        attack_priorities.append({"priority": 1, "instruction": "Target space behind defensive line", "detail": "Quick through-balls to striker runs; timing is crucial on offside trap"})
    if "slow_build_from_back" in weaknesses or "vulnerable_to_pressing" in weaknesses:
        attack_priorities.append({"priority": 2, "instruction": "Press immediately on opponent build-up", "detail": "Front 3 press with triggers on goalkeeper, back pass, or poor touch"})
    if "right_back_pace_issue" in weaknesses or "right_flank_less_active" in weaknesses:
        attack_priorities.append({"priority": 1, "instruction": "Attack right back aggressively", "detail": "Create 2v1 with winger and full-back on their weak flank consistently"})
    if "wide_spaces_behind_wing_backs" in weaknesses:
        attack_priorities.append({"priority": 1, "instruction": "Exploit spaces behind advancing wing-backs", "detail": "Early balls in behind — time the run when wing-backs are forward"})
    if not attack_priorities:
        attack_priorities.append({"priority": 1, "instruction": "Patient possession build-up", "detail": "Create overloads in central areas, switch play to exploit wide gaps"})

    defend_priorities = []
    opp_strengths = opp_tactics.get("strengths", [])
    if "set_piece_threat" in opp_strengths:
        defend_priorities.append({"priority": 1, "instruction": "Zonal set piece defense", "detail": "Mark zones not players on corners; attack the ball early"})
    if "clinical_striker" in opp_strengths or "striker_quality" in opp_strengths:
        defend_priorities.append({"priority": 1, "instruction": "Isolate their striker", "detail": "CB partner takes offensive duel; screening midfielder restricts supply"})
    if opp_tactics.get("attackStyle") == "counter_attack":
        defend_priorities.append({"priority": 1, "instruction": "Block counter-attack space", "detail": "No simultaneous full-back advances; always leave DM protecting back line"})
    if not defend_priorities:
        defend_priorities.append({"priority": 1, "instruction": "Compact mid-block", "detail": "4-5m spacing between lines; maintain shape; press at designated triggers"})

    player_instructions = []
    for p in team.get("players", []):
        inst = ""
        if p["position"] == "ST":
            inst = "Time runs in behind last defender." if "vulnerable_behind_high_line" in weaknesses else "Hold up play and link with midfield."
        elif p["position"] in ["LW", "RW"]:
            inst = "Attack right back with pace." if "right_back_pace_issue" in weaknesses else "Stay wide, cut inside to shoot."
        elif p["position"] == "CM":
            inst = "Control tempo, switch play. Screen space when defending."
        elif p["position"] == "CB":
            inst = "Stay tight on striker; communicate with goalkeeper." if opp_strengths else "Maintain line, intercept early."
        elif p["position"] in ["LB", "RB"]:
            inst = "Overlap wide player when attacking; track back immediately on transition."
        if inst:
            player_instructions.append({"player": p["name"], "position": p["position"], "instruction": inst, "isKeyPlayer": p["rating"] >= 8.3})

    recommendation = {
        "formation": formation,
        "formationData": FORMATIONS.get(formation),
        "alternativeFormation": alt_formation,
        "alternativeFormationData": FORMATIONS.get(alt_formation),
        "attacking": {"style": team_tactics.get("attackStyle", "possession_based").replace("_", " "), "buildUp": "short_passing", "priorities": attack_priorities, "keyInstructions": [p["instruction"] for p in attack_priorities]},
        "defending": {"structure": "compact_block", "lineHeight": "medium", "pressingIntensity": "medium", "priorities": defend_priorities, "keyInstructions": [p["instruction"] for p in defend_priorities]},
        "pressing": {"trigger": opp_tactics.get("pressingTriggers", ["back_pass"])[:3], "intensity": "high" if team_tactics.get("attackStyle") == "possession_based" else "medium", "description": "Press in mid-block with designated triggers."},
        "transitions": {"attacking": "Win ball → immediate vertical pass → 3-second sprint transition", "defending": "Lose ball → immediate press → recover compact shape within 6 seconds", "focus": "Block counter on turnover" if opp_tactics.get("attackStyle") == "counter_attack" else "Quick transitions with pace"},
        "setpieces": {"attacking": {"corners": "Near post flick-on with second-wave runner", "freekicks": "Near post wall jump and second man runner on far post", "keyTaker": next((p["name"] for p in sorted(team.get("players", []), key=lambda x: x["assists"], reverse=True) if p["assists"] > 7), "Set piece specialist")}, "defending": {"corners": "Full zonal — assign zones 1-6" if "set_piece_threat" in opp_strengths else "Mixed zonal and man-marking", "freekicks": "5-man wall, goalkeeper commands area"}},
        "playerInstructions": player_instructions,
        "summary": strat["text"],
        "reasoning": strat["reasoning"],
        "confidence": strat["confidence"]
    }

    strategy_result = {
        "agent": "Strategy Recommendation Agent",
        "recommendation": recommendation,
        "alternativePlans": [
            {"scenario": "If losing by 1 goal (60+ minutes)", "formation": "3-4-3", "description": "Push extra attacker, wing-backs for width, direct attacking play"},
            {"scenario": "If winning and need to protect lead", "formation": "5-3-2", "description": "Drop deep with five defenders, counter only"},
            {"scenario": "If opponent changes to high press", "formation": "4-2-3-1", "description": "Double pivot shields back, quick triangles to bypass press"}
        ],
        "inGameAdjustments": [
            {"trigger": "Winning by 1 goal (last 15 min)", "action": "Narrow shape to 4-5-1, reduce pressing risk"},
            {"trigger": "Losing by 1 goal (60+ min)", "action": "Push full-backs higher, add extra attacker"},
            {"trigger": "Opponent exploiting wide areas", "action": "Drop wide midfielder to form 4-4-2 defensive shape"},
            {"trigger": "Red card (10 vs 11)", "action": "Reorganize to 4-4-1, compact shape, counter-attack on chance"},
            {"trigger": "Opponent fatigue (70+ min)", "action": "Increase tempo, more direct play, substitute fresh legs"}
        ],
        "keyPrinciples": [
            "Maintain tactical shape — individual brilliance within the system",
            f"Press as a unit — trigger at {'goalkeeper' if 'slow_build_from_back' in weaknesses else 'designated cues'} only",
            f"Attack with width to exploit {weaknesses[0].replace('_', ' ') if weaknesses else 'identified vulnerabilities'}",
            "Transitions: 6-second rule — press or reorganize within 6 seconds of losing the ball",
            "Set pieces: assign zones, all 11 in designated positions before every corner"
        ],
        "supportingEvidence": rag.retrieve(f"{team['name']} vs {opponent['name']}", top_k=3),
        "confidence": strat["confidence"]
    }

    # Explanation
    coaching_points = [
        "Press as a unit — not individually",
        "Wide players stay wide until ball is in final third",
        f"Target opponent's weaker flank from the first whistle",
        "Keep shape in defensive transitions — no chasing",
        "Set pieces: assign zones, not man-to-man on all corners"
    ]
    formation_tips = {
        "4-3-3": "Four defenders give width at the back. Three midfielders control the game. Three forwards press and create chances.",
        "4-2-3-1": "Two defensive midfielders are your safety net. The number 10 links everything. The lone striker is focal point.",
        "3-5-2": "Three CBs give defensive cover. Wing-backs create width. Two strikers work as a unit.",
        "4-4-2": "Two banks of four — compact, organized, hard to break down. The two strikers work together.",
        "5-3-2": "Five defenders means rock solid. When you win ball, burst forward on counter. Discipline and patience."
    }
    pregame_checklist = [
        f"✓ Formation confirmed: {formation} — everyone knows their position",
        f"✓ Primary target: {attack_priorities[0]['instruction'] if attack_priorities else 'Attack with purpose'}",
        f"✓ Defensive key: {defend_priorities[0]['instruction'] if defend_priorities else 'Stay organized'}",
        f"✓ Press triggers: {', '.join(opp_tactics.get('pressingTriggers', ['back pass'])[:3])}",
        "✓ Set piece zones assigned: corners and free-kicks practiced",
        f"✓ Alternative formation ready: {alt_formation} if game state requires",
        f"✓ Key player to neutralize: {sorted(opponent.get('players', []), key=lambda p: p['rating'], reverse=True)[0]['name'] if opponent.get('players') else 'their striker'}",
        "✓ Transition rule: 6 seconds to press or reorganize after losing ball"
    ]

    explanation = {
        "agent": "Insight Explanation Agent",
        "briefing": {
            "openingStatement": f"Today we face {opponent['name']}. Here's exactly how we win this game.",
            "formationRationale": f"We set up in {formation}. {formation_tips.get(formation, 'This formation matches our strengths.')}",
            "primaryObjective": attack_priorities[0]["instruction"] if attack_priorities else "Dominate possession"
        },
        "pregameChecklist": pregame_checklist,
        "halftimeAdjustments": [
            {"scenario": "Winning at halftime", "instruction": "Keep the shape. No unnecessary risks. Let them come. One change max."},
            {"scenario": "Drawing at halftime", "instruction": "Push full-backs 10m higher. More direct to striker. Front 3 press on goalkeeper kicks."},
            {"scenario": "Losing at halftime", "instruction": "Switch to attacking formation immediately. Bring on striker sub. Increase press — their back line is not comfortable."},
            {"scenario": "Opponent changed formation", "instruction": "More crosses, switch play quicker, test goalkeeper with long shots."}
        ],
        "playerTalkingPoints": player_instructions[:6],
        "tacticalKeywords": [formation, "press", "transitions", "width", "shape"] + [w.replace("_", " ") for w in weaknesses[:3]],
        "explanation": {"text": f"Here's what this means on the pitch: {formation_tips.get(formation, '')} Against {opponent['name']}, the key instruction is: {attack_priorities[0]['detail'] if attack_priorities else 'apply the attacking plan'}. Defensively: {defend_priorities[0]['detail'] if defend_priorities else 'hold your shape'}.", "confidence": 0.9, "coachingPoints": coaching_points}
    }

    summary = {
        "teamName": team["name"], "opponentName": opponent["name"],
        "recommendedFormation": formation, "alternativeFormation": alt_formation,
        "topAttackingPriority": attack_priorities[0]["instruction"] if attack_priorities else None,
        "topDefensivePriority": defend_priorities[0]["instruction"] if defend_priorities else None,
        "keyWeaknessToExploit": weaknesses[0].replace("_", " ") if weaknesses else None,
        "overallConfidence": round((match_analysis_text["confidence"] + 0.85 + strat["confidence"]) / 3, 2),
        "pregameChecklist": pregame_checklist
    }

    return {
        "pipelineId": f"{team_id}_vs_{opponent_id}_{int(datetime.utcnow().timestamp())}",
        "aiBackend": "IBM Granite (WatsonX)" if is_granite_available() else "Rule-Based Reasoning Engine",
        "graniteConnected": is_granite_available(),
        "note": None if is_granite_available() else "IBM Granite credentials not configured. Using local reasoning engine. Add IBM_API_KEY and IBM_PROJECT_ID to .env to enable.",
        "agents": {
            "matchAnalysis": match_analysis,
            "opponentAnalysis": opponent_analysis,
            "strategyRecommendation": strategy_result,
            "insightExplanation": explanation
        },
        "summary": summary,
        "timestamp": datetime.utcnow().isoformat()
    }

# ───────────────────────────────────────────────────────────────
# API ROUTES
# ───────────────────────────────────────────────────────────────

@app.route('/api/status')
def status():
    return jsonify({
        "success": True, "status": "online",
        "aiBackend": "IBM Granite (WatsonX)" if is_granite_available() else "Rule-Based Engine (Fallback)",
        "graniteConnected": is_granite_available(),
        "ragStatus": "ready", "version": "1.0.0",
        "agentPipeline": ["Match Analysis Agent", "Opponent Strategy Agent", "Strategy Recommendation Agent", "Insight Explanation Agent"],
        "dataMode": "demo", "teamsLoaded": len(TEAMS), "matchesLoaded": len(MATCHES)
    })

@app.route('/api/teams')
def get_teams():
    return jsonify({"success": True, "teams": [{"id": t["id"], "name": t["name"], "shortName": t["shortName"], "formation": t["formation"], "color": t["color"]} for t in TEAMS]})

@app.route('/api/teams/<team_id>')
def get_team(team_id):
    team = next((t for t in TEAMS if t["id"] == team_id), None)
    if not team:
        return jsonify({"success": False, "error": "Team not found"}), 404
    return jsonify({"success": True, "team": team})

@app.route('/api/matches')
def get_matches():
    team_id = request.args.get('teamId')
    result = [m for m in MATCHES if not team_id or m["homeTeam"] == team_id or m["awayTeam"] == team_id]
    return jsonify({"success": True, "matches": result, "count": len(result)})

@app.route('/api/matches/<match_id>')
def get_match(match_id):
    match = next((m for m in MATCHES if m["id"] == match_id), None)
    if not match:
        return jsonify({"success": False, "error": "Match not found"}), 404
    home_team = next((t for t in TEAMS if t["id"] == match["homeTeam"]), None)
    away_team = next((t for t in TEAMS if t["id"] == match["awayTeam"]), None)
    return jsonify({"success": True, "match": {**match, "homeTeamData": home_team, "awayTeamData": away_team}})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json or {}
    team_id = data.get('teamId')
    opponent_id = data.get('opponentId')
    if not team_id or not opponent_id:
        return jsonify({"success": False, "error": "teamId and opponentId required"}), 400
    if team_id == opponent_id:
        return jsonify({"success": False, "error": "Team and opponent cannot be the same"}), 400
    try:
        result = run_full_pipeline(team_id, opponent_id)
        return jsonify({"success": True, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analyze/team', methods=['POST'])
def analyze_team():
    data = request.json or {}
    team_id = data.get('teamId')
    if not team_id:
        return jsonify({"success": False, "error": "teamId required"}), 400
    team = next((t for t in TEAMS if t["id"] == team_id), None)
    if not team:
        return jsonify({"success": False, "error": "Team not found"}), 404
    team_matches = [m for m in MATCHES if m["homeTeam"] == team_id or m["awayTeam"] == team_id]
    analysis = generate_match_analysis(team, team_matches)
    formation_history = {}
    for m in team_matches:
        f = m["homeFormation"] if m["homeTeam"] == team_id else m["awayFormation"]
        formation_history[f] = formation_history.get(f, 0) + 1
    formation_history = [{"formation": f, "count": c, "percentage": round(c/max(len(team_matches),1)*100)} for f, c in formation_history.items()]
    return jsonify({"success": True, "agent": "Match Analysis Agent", "teamId": team_id, "team": team, "analysis": analysis, "formationHistory": formation_history, "ragDocuments": len(rag.retrieve(team["name"], top_k=3)), "playerInsights": sorted([dict(p, **{"isKeyPlayer": p["rating"] >= 8.3}) for p in team.get("players", [])], key=lambda x: x["rating"], reverse=True), "timestamp": datetime.utcnow().isoformat()})

@app.route('/api/analyze/opponent', methods=['POST'])
def analyze_opponent():
    data = request.json or {}
    opponent_id = data.get('opponentId')
    if not opponent_id:
        return jsonify({"success": False, "error": "opponentId required"}), 400
    result = build_opponent_analysis(opponent_id)
    if not result:
        return jsonify({"success": False, "error": "Opponent not found"}), 404
    return jsonify({"success": True, **result})

@app.route('/api/live', methods=['POST'])
def live_advice():
    ctx = request.json or {}
    if not ctx.get('score') or not ctx.get('minute'):
        return jsonify({"success": False, "error": "score and minute required"}), 400
    granite_result = call_granite(f"Live match: {ctx.get('score')} at {ctx.get('minute')}'. Formation: {ctx.get('teamFormation')} vs {ctx.get('opponentFormation')}. Notes: {ctx.get('notes', '')}. Provide 3 urgent tactical suggestions:", 400)
    if granite_result:
        analysis = {"text": granite_result, "advice": [granite_result.strip()], "urgency": "normal", "confidence": 0.9, "dataSource": "ibm_granite"}
    else:
        analysis = generate_live_advice(ctx)
    return jsonify({"success": True, "agent": "Live Match Advisor", "context": ctx, "analysis": analysis, "timestamp": datetime.utcnow().isoformat()})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    question = data.get('question', '')
    team_id = data.get('teamId', '')
    opponent_id = data.get('opponentId', '')
    if not question:
        return jsonify({"success": False, "error": "question required"}), 400
    team = next((t for t in TEAMS if t["id"] == team_id), TEAMS[0] if TEAMS else None)
    opponent = next((t for t in TEAMS if t["id"] == opponent_id), None)
    rag_ctx = rag.retrieve(question, top_k=5, filter_team=team_id)
    ctx_text = " ".join([d["content"][:300] for d in rag_ctx[:2]])
    prompt = f"You are an AI football tactical assistant. Data: {ctx_text}\n\nQuestion: {question}\n\nAnswer (specific, data-backed, practical):"
    granite_result = call_granite(prompt, 500)
    if granite_result:
        response = {"text": granite_result, "confidence": 0.9, "dataSource": "ibm_granite", "agentPipeline": ["RAG Retrieval", "Match Analysis", "Opponent Analysis", "Strategy", "Explanation"]}
    else:
        response = generate_chat_response(question, team, opponent, rag_ctx)
    return jsonify({"success": True, "question": question, "response": response, "ragDocuments": len(rag_ctx), "agentPipeline": response.get("agentPipeline", []), "timestamp": datetime.utcnow().isoformat()})

@app.route('/api/formations')
def get_formations():
    name = request.args.get('name')
    if name:
        f = FORMATIONS.get(name)
        if not f:
            return jsonify({"success": False, "error": "Formation not found"}), 404
        return jsonify({"success": True, "formation": f})
    return jsonify({"success": True, "formations": FORMATIONS})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({"success": False, "error": "No file selected"}), 400
    content = file.read().decode('utf-8')
    filename = file.filename.lower()
    try:
        if filename.endswith('.json'):
            parsed = json.loads(content)
            records = parsed if isinstance(parsed, list) else [parsed]
        elif filename.endswith('.csv'):
            reader = csv.DictReader(io.StringIO(content))
            records = list(reader)
        else:
            try:
                parsed = json.loads(content)
                records = parsed if isinstance(parsed, list) else [parsed]
            except:
                reader = csv.DictReader(io.StringIO(content))
                records = list(reader)
        count = rag.ingest(records)
        return jsonify({"success": True, "message": f"Successfully ingested {count} records", "recordsAdded": count, "filename": file.filename, "format": "json" if filename.endswith('.json') else "csv"})
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to process file: {str(e)}"}), 400

@app.route('/api/upload/template')
def download_template():
    csv_content = "date,homeTeam,awayTeam,homeScore,awayScore,homeFormation,awayFormation,homePossession,awayPossession,homeShots,awayShots,homeShotsOnTarget,awayShotsOnTarget,homePassAccuracy,awayPassAccuracy,competition\n2024-11-01,My Team,Opponent A,2,1,4-3-3,4-2-3-1,56,44,13,9,6,4,85,79,League\n2024-10-25,Opponent B,My Team,0,2,4-4-2,4-3-3,48,52,10,14,3,7,80,86,League"
    response = make_response(csv_content)
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = 'attachment; filename=match_data_template.csv'
    return response

@app.route('/health')
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=None):
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    index = os.path.join(static_dir, 'index.html')
    if os.path.exists(index):
        return send_from_directory(static_dir, 'index.html')
    return jsonify({"message": "TacticAI Backend Running", "docs": "Frontend at /static/index.html", "api": "/api"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    print(f"\n🏆 AI Game Strategy Advisor Backend (Python)")
    print(f"📡 Running on http://localhost:{port}")
    print(f"🌐 Frontend at http://localhost:{port}/")
    print(f"🤖 AI Backend: {'IBM Granite (WatsonX)' if is_granite_available() else 'Rule-Based Reasoning Engine'}")
    print(f"📊 Demo data: {len(TEAMS)} teams, {len(MATCHES)} matches loaded\n")
    app.run(host='0.0.0.0', port=port, debug=False)
