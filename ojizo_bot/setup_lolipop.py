import subprocess
import sys

def install(package):
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--user"])

if __name__ == "__main__":
    libs = ["pytz", "tweepy", "openai", "python-dotenv"]
    for lib in libs:
        try:
            install(lib)
        except Exception as e:
            print(f"Failed to install {lib}: {e}")
    print("Setup complete! Namu Nyaga Mandala.")
