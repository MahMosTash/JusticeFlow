"""
Utility functions for the Police Case Management System.
"""
from datetime import datetime, timedelta


def calculate_days_under_investigation(start_date):
    """
    Calculate number of days a suspect has been under investigation.
    
    Args:
        start_date: The date when investigation started
        
    Returns:
        int: Number of days
    """
    if not start_date:
        return 0
    
    delta = datetime.now().date() - start_date
    return max(0, delta.days)


def calculate_most_wanted_ranking(severity_level, days_under_investigation):
    """
    Calculate Most Wanted ranking using formula: max(Lj) × max(Di)
    
    Where:
        Lj = crime severity (1-4: Level 3=1, Level 2=2, Level 1=3, Critical=4)
        Di = number of days under investigation
    
    Args:
        severity_level: Crime severity level (string)
        days_under_investigation: Number of days (int)
        
    Returns:
        int: Ranking score
    """
    severity_map = {
        'Level 3': 1,
        'Level 2': 2,
        'Level 1': 3,
        'Critical': 4,
    }
    
    severity_value = severity_map.get(severity_level, 1)
    return severity_value * days_under_investigation


def calculate_reward_amount(severity_level, days_under_investigation):
    """
    Calculate reward amount using formula: max(Lj) × max(Di) × 20,000,000
    
    Args:
        severity_level: Crime severity level (string)
        days_under_investigation: Number of days (int)
        
    Returns:
        int: Reward amount in base currency
    """
    ranking = calculate_most_wanted_ranking(severity_level, days_under_investigation)
    return ranking * 20000000


def generate_reward_code():
    """
    Generate a unique reward code.
    
    Returns:
        str: Unique reward code
    """
    import secrets
    import string
    
    # Generate 12-character alphanumeric code
    alphabet = string.ascii_uppercase + string.digits
    code = ''.join(secrets.choice(alphabet) for _ in range(12))
    return f'RWD-{code}'

