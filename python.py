import http.server
import socketserver
import os

# Port to host the server (Change if needed)
PORT = 8000

# Set the correct build directory (modify this if your build folder is elsewhere)
BUILD_DIR = r"C:\Users\mugil\Desktop\Genik\Kiki Kreations\kikikreations\dist"  # Use raw string (r"")

# Ensure the build directory exists
if not os.path.exists(BUILD_DIR):
    print("⚠️ Error: 'dist' folder not found. Run 'npm run build' first.")
    exit(1)

# Change working directory to 'dist' folder
os.chdir(BUILD_DIR)

# Create an HTTP server handler
Handler = http.server.SimpleHTTPRequestHandler

# Set up and start the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 Server running at: http://localhost:{PORT}/")
    print("📡 Access from other devices: http://{os.popen('ipconfig | findstr IPv4').read().strip().split()[-1]}:{PORT}/")
    print("Press CTRL+C to stop the server.")
    httpd.serve_forever()
