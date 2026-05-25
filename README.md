# Mouth Breathing Detector

A website that detects whether a person's mouth is open or closed. The goal is to detect whether the user is breathing through their mouth or their nose.

Mouth breathing can be harmful when it becomes a regular habit because the nose is designed to filter, warm, and humidify the air before it reaches the lungs. Breathing through the mouth can dry out the mouth and throat, increase the risk of bad breath and dental problems, and reduce sleep quality by contributing to snoring or sleep apnea. In children, long-term mouth breathing may even affect facial development and posture. It can also lead to less efficient oxygen intake compared to nasal breathing.

## System Architecture & Tech Stack

This project is built as a lightweight, web-based computer vision application split into a clean client-server architecture:

### Frontend
* **HTML5:** Structures the layout, camera viewport, and dashboard overlay.
* **JavaScript (ES6+):** Handles real-time video stream capture from the webcam, runs face/mouth tracking algorithms, and manages UI states.

### Backend
* **Node.js:** Powers the application server environment.

### How It Works
1. **Capture:** The browser requests webcam permission via HTML5/JavaScript.
2. **Detection:** Client-side JavaScript analyzes the facial/mouth geometry in real time to calculate if the mouth is open.
3. **Processing/Logging:** The frontend communicates with the Node.js backend to handle server-side configurations or log detection events.


Made with Claude Code.


# Demo Video

<p align="left">
  <a href="https://www.youtube.com/watch?v=OZvwEpikUNw">
    <img src="https://img.youtube.com/vi/OZvwEpikUNw/maxresdefault.jpg" alt="Demo Video" width="70%">
  </a>
</p>
