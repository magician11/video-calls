import React, { useEffect, useRef, useState } from 'react';
import { Container } from '@material-ui/core';
import Peer from 'peerjs';
import io from 'socket.io-client';

const myPeer = new Peer();

const Video = props => {
  const ref = useRef();

  useEffect(() => {
    ref.current.srcObject = props.stream;
  }, []);

  return <video muted playsInline autoPlay ref={ref} />;
};

const Room = props => {
  const [peers, setPeers] = useState({});
  const socketRef = useRef();
  const userVideo = useRef();
  const roomID = props.match.params.roomID;

  useEffect(() => {
    socketRef.current = io.connect('/');
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        userVideo.current.srcObject = stream;

        // listening for any users calling me...
        myPeer.on('call', call => {
          console.log('Someone is calling me...');
          call.answer(stream);
          console.log('Just answered with my stream');

          call.on('stream', userVideoStream => {
            console.log('about to add a video stream for someone..', call.peer);
            setPeers({
              ...peers,
              [call.peer]: { videoStream: userVideoStream, call }
            });
          });
        });

        // watch for new users connecting
        socketRef.current.on('user-connected', userId => {
          console.log('A new user connected to the room with ID ', userId);
          connectToNewUser(userId, stream);
        });
      });

    socketRef.current.on('user-disconnected', userId => {
      console.log('user disconnected', userId);
      delete peers[userId];
      setPeers(peers);
    });

    // this is when I join the room
    myPeer.on('open', id => {
      console.log('I just joined the room! My ID is ', id);
      socketRef.current.emit('join-room', roomID, id);
    });

    // connect to the new user with my stream
    const connectToNewUser = (userId, stream) => {
      console.log(
        `Ok let's connect to the new user that has the ID ${userId}. We'll send our stream to them. Calling them now..`
      );
      const call = myPeer.call(userId, stream);
      call.on('stream', userVideoStream => {
        setPeers({
          ...peers,
          [userId]: { videoStream: userVideoStream, call }
        });
      });
    };
  }, []);

  return (
    <Container>
      <video muted ref={userVideo} autoPlay playsInline />
      {Object.keys(peers).map(userId => (
        <Video key={userId} stream={peers[userId].videoStream} />
      ))}
    </Container>
  );
};

export default Room;
