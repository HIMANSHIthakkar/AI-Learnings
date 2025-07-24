#!/usr/bin/env python3
"""
Simple HTTP server for previewing the AI Assistant application.
Run this script to start a local development server.
"""

import http.server
import socketserver
import webbrowser
import os
import threading
import time

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        print(f"[{self.log_date_time_string()}] {format % args}")

def open_browser():
    """Open the browser after a short delay"""
    time.sleep(1)
    print(f"\n🚀 Opening AI Assistant in your browser...")
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🤖 AI Assistant Preview Server")
        print("=" * 60)
        print(f"📍 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("💡 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        # Open browser in a separate thread
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Shutting down the server...")
            httpd.shutdown()

if __name__ == "__main__":
    main()