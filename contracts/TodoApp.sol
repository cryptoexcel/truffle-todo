pragma solidity ^0.4.17;
contract TodoApp {
    struct Todo {
       address owner;
       bytes32 task;
       bool completed;
       address completed_by;
       uint completed_at;
    }
    address owner;
    Todo[] tasks;
    
    modifier isOwner { require(msg.sender == owner); _; }
    
    event todoAdded(address owner, bytes32 task);
    event todoCompleted(uint index);

    function TodoApp() public {
        owner = msg.sender;
    }
    function addTodo(bytes32 task) public {
        require(tasks.length < 80);
        Todo memory todo = Todo(msg.sender, task, false, 0, 0);
        tasks.push(todo);
        todoAdded(msg.sender,task);
    }
    
    function getTodos() public constant returns (bytes32[]){
        bytes32[] memory tasksTemp = new bytes32[](80); //in memory array needs to have length
        //assuming in the application we have maximum of 80 todos
        for (uint i = 0; i < tasks.length; i++) {
            tasksTemp[i] = tasks[i].task; //push doesn't work for memory array
        }
        return tasksTemp;
    }
    
    function getTodo(uint index) public constant returns (bytes32,address,bool,address,uint){
        Todo memory todo = tasks[index];
        assert(todo.owner != 0);
        return (todo.task, todo.owner, todo.completed, todo.completed_by, todo.completed_at);
    } 
    function completeTodo(uint index) public {
        tasks[index].completed = true;
        tasks[index].completed_by = msg.sender;
        tasks[index].completed_at = now;
        todoCompleted(index);
    }
}