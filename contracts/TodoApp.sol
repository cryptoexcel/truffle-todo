pragma solidity ^0.4.19;
contract TodoApp {
    struct Todo {
       address owner;
       bytes32 task;
       bool completed;
       address completed_by;
       uint completed_at;
       uint priority;
    }
    address owner;
    Todo[] tasks;
    
    modifier isOwner { require(msg.sender == owner); _; }
    
    event todoAdded(address owner, bytes32 task);
    event todoCompleted(uint index);

    function TodoApp() public {
        owner = msg.sender;
    }
    function addPriorityTodo(bytes32 task) public payable {
        require(tasks.length < 80);
        require(msg.value > 0);
        Todo memory todo = Todo(msg.sender, task, false, 0, 0, msg.value);
        tasks.push(todo);
        todoAdded(msg.sender,task);
    }
    function addTodo(bytes32 task) public {
        require(tasks.length < 80);
        Todo memory todo = Todo(msg.sender, task, false, 0, 0, 0);
        tasks.push(todo);
        todoAdded(msg.sender,task);
    }
    
    function getTodos() public constant returns (bytes32[]){
        uint j = 0;
        bytes32[] memory tasksTemp = new bytes32[](80); //in memory array needs to have length
        //assuming in the application we have maximum of 80 todos
        for (uint i = 0; i < tasks.length; i++) {
            if(tasks[i].priority > 0){
                //here we are simply priority tasks on top. 
                //this can be done better because right now even if a person paid for ETH
                //his task might not be at top. but this is fine for demo puporse. 
                tasksTemp[i] = tasksTemp[j];
                tasksTemp[j] = tasks[i].task;
                j++;
            }else{
                tasksTemp[i] = tasks[i].task; //push doesn't work for memory array
            }
        }
        return tasksTemp;
    }
    
    function getTodo(uint index) public constant returns (bytes32,address,bool,address,uint,uint){
        Todo memory todo = tasks[index];
        assert(todo.owner != 0);
        return (todo.task, todo.owner, todo.completed, todo.completed_by, todo.completed_at, todo.priority);
    } 
    function completeTodo(uint index) public {
        tasks[index].completed = true;
        tasks[index].completed_by = msg.sender;
        tasks[index].completed_at = now;
        todoCompleted(index);
    }
}