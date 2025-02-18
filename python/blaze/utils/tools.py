import threading
from zoneinfo import ZoneInfo
from datetime import datetime


def time_now(tzx='Europe/London'):
    tz = ZoneInfo(tzx)
    return datetime.now(tz)


def time_now_str(tzx='Europe/London'):
    return time_now(tzx).strftime('%Y-%m-%d %H:%M:%S')


def word_count(text):
    return len(text.split(' '))


def timeout(timeout_duration=1, default=None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            class InterruptableThread(threading.Thread):
                def __init__(self):
                    threading.Thread.__init__(self)
                    self.result = default

                def run(self):
                    try:
                        self.result = func(*args, **kwargs)
                    except:
                        self.result = default

            it = InterruptableThread()
            it.start()
            it.join(timeout_duration)
            if it.is_alive():
                print(f'Function execution exceeded {timeout_duration} seconds. Timeout.')
                return default
            else:
                return it.result
        return wrapper
    return decorator
