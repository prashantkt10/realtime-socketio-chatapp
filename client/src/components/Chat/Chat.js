import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";
import Sound from "react-sound";
import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import './Chat.css';
import MessageTune from '../../assets/message_tone.mp3';

let socket;

const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [tunePlayingStatus, setTunePlayingStatus] = useState('PAUSED')
    const ENDPOINT = 'https://pk-chat-app.herokuapp.com/';
    useEffect(() => {
        const { name, room } = queryString.parse(location.search);
        socket = io(ENDPOINT); setRoom(room); setName(name)
        socket.emit('join', { name, room }, (error) => { if (error) { alert(error); } });
    }, [ENDPOINT, location.search]);
    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message]);
            console.log('message.user != name', message.user, name);
            if (message.user.toLocaleLowerCase() != name.toLocaleLowerCase()) playAndPauseNewMessageTune();
        });
        socket.on('roomData', ({ users }) => { setUsers(users); });
        return () => { socket.emit('disconnect'); socket.off(); }
    }, [messages])
    const sendMessage = (event) => {
        event.preventDefault();
        if (message) { socket.emit('sendMessage', message, () => setMessage('')); }
    }
    const playAndPauseNewMessageTune = () => {
        setTunePlayingStatus("PLAYING");
        setTimeout(() => setTunePlayingStatus("PAUSED"), 4000);
    }
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
            <Sound
                url={MessageTune}
                playStatus={tunePlayingStatus}
                loop={false}
                volume="20"
            />
        </div>
    );
}
export default Chat;