package com.substring.chat.contorllers;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import com.substring.chat.config.AppConstants;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.payload.MessageRequest;
import com.substring.chat.repositories.RoomRepository;

@Controller
@CrossOrigin(AppConstants.FRONT_END_BASE_URL)
public class chatController
{
    private RoomRepository roomRepository;

    public chatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }


    //for sending and recieving messages

    @MessageMapping("/sendMessage/{roomId}")//app/chat/sendmessage/{roomId}
    @SendTo("/topic/room/{roomId}")//subscribe
    public Message sendMessage(
        @DestinationVariable String roomId,
        @RequestBody MessageRequest  request
    )
    {

        Room room = roomRepository.findByRoomId((request.getRoomId()));

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if(room != null)
        {
            room.getMessages().add(message);
            roomRepository.save(room);
        }
        else
        {
            throw new RuntimeException("Room not found");
        }
        return message;
        
    }


}
