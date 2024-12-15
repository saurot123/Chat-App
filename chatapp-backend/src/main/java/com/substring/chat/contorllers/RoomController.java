package com.substring.chat.contorllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.substring.chat.config.AppConstants;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(AppConstants.FRONT_END_BASE_URL)
public class RoomController {

    private RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository)
    {
        this.roomRepository = roomRepository;
    }

    //Create rooms
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId)
    {
        if(roomRepository.findByRoomId(roomId) != null)
        {
            //room already present
            return ResponseEntity.badRequest().body("Room already Exist!");
        }
        // create new room
        Room room = new Room();
        room.setRoomId(roomId);
        @SuppressWarnings("unused")
        Room savedRoom = roomRepository.save(room);

        return ResponseEntity.status(HttpStatus.CREATED).body(room);

    }


    //get rooms
    @GetMapping("/{roomId}")
    public ResponseEntity<?>joinRoom(@PathVariable String roomId)
    {
        Room room = roomRepository.findByRoomId(roomId);
        if(room == null)
        {
            return ResponseEntity.badRequest().body("Room not found");
        }
        return ResponseEntity.ok(room);
    }

    
    //get message of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
        @PathVariable String roomId,
        @RequestParam(value="page", defaultValue = "0",required = false) int page,
        @RequestParam(value="size", defaultValue = "20", required = false) int size
        )
    {

        Room room = roomRepository.findByRoomId(roomId);
        if(room == null)
        {
           return ResponseEntity.badRequest().build();
        }
        
        //get messages:
        //pagination
        //size
        List<Message>messages = room.getMessages();
        int start = Math.max(0, messages.size() - (page + 1)*size);
        int end = Math.min(messages.size(), start + size);

        List<Message>paginatedMessages = messages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }

}
