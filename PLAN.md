- Log issue for newline on windows with Python

- Try out full buffer updates for python

- Listen to response for capabilities
    - Store server capabilities
    - Gate highlighting based on capabilities
    - Gate buffer updates based on capabilities

- Look upwards for proper source directory (__init.py__, setup.py)
- Factor search upwards

- Create server capabilities variable
    - Port over types from protocol.md
    - Decide where to do full update or incremental update based on server capabilities

