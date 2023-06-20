    import { useEffect, useRef, useState } from "react";
    import SelectElem from "../components/SelectElem";
    import SudokuElem from "../components/SudokuElem";
    import { LoginSocialGoogle} from "reactjs-social-login";
    import './sudokuGame.css';
    import LeaderBoard from "../components/LeaderBoard";
    import UserAccountScreen from "../components/UserAccountScreen";
    import googleImg from "../assets/google.png" ;
    import leaderBoardImg from '../assets/leaderBoard.svg'
    import pauseImg from '../assets/pause.svg' 
    import playImg from '../assets/play.svg' 


    function SudokuGame(){
        
        // global variables 
        const submitbtn = useRef();
        const resetbtn = useRef();
        const hudRef = useRef();
        const sudoku = useRef();
        const [board, setBoard] = useState([]);
        const [currX ,  setCurrx] = useState(0);
        const [currY ,  setCurry] = useState(0);
        const [isValid ,  setIsValid] = useState(false);
        const [currentUser,setCurrentUser] = useState({});
        const [allUsers,setAllUsers] = useState([]);
        const [oauthData,setOauthData] = useState({});
        const [isLeaderBoardClicked,setIsLeaderBoardClicked] = useState(false);
        const [isUserAccClicked,setIsUserAccClicked] = useState(false);
        const [nowGameScore,setNowGameScore] = useState(0);
        const [heart,setHeart] = useState(3);
        const [gameStarted,setGameStarted] = useState(false);
        const [gameOver,setGameOver] = useState(false);
        const [todayGameWon,setTodayGameWon] = useState(false);
        const [gameTimer , setGameTimer ] = useState({hours : 0 , minutes : 0 , seconds : 0});
        const [timerInterval, setTimerInterval] = useState(null);
        const [isConnected, setIsConnected] = useState(false);
        let today = '';
        
        const sendHTTPRequest = async (url , method , data) =>{
            let returnData = null;
            await fetch(url , {
                method : method,
                body : JSON.stringify(data),
                headers : {'content-Type' : 'application/json'}  
            }).then((response)=>{return response.json()}).then((response)=>returnData = response).catch((err)=>console.log("cannot retrive data!",err));
            return returnData;
        } 

        // initializing game
        useEffect( () => {
            connectToServer();
            getLeaderBoard();
            async function boardCreator(){
                // const getTimeApi = `http://worldtimeapi.org/api/timezone/Asia/Kolkata`;
                // let dateApiData = await sendHTTPRequest(getTimeApi,'GET');
                // console.log(dateApiData);
                today = new Date().toLocaleDateString('en-US',{day : 'numeric' , month : "short",year : "numeric"});
                // console.log(today);
                const isBoardAvail = await fetchBoard(today); 
                if(isBoardAvail===false){console.log('entering sudoku game'); sudokuGame();}
            }
            boardCreator();   
            // submit and reset buttons
            let eventlist2 = submitbtn.current.addEventListener('click', async ()=>{
                if(verifySudoku() || true)console.log("isValid at listen : " , isValid);
                if(isValid==true)
                {
                    alert('Congratulations! You won the game');
                    calculateScore();
                    setCurrentUser((prevCurrentUser)=>{
                        return {...prevCurrentUser,todayScore : nowGameScore};
                    }) 
                    setTodayGameWon(true);
                    updateRanking();
                    const updatePlayerStats = {
                        numberOfGamesPlayed : currentUser.numberOfGamesPlayed+1 ,
                        totalScore : currentUser.totalScore + nowGameScore,
                        todayScore : nowGameScore,
                        todayRanking : currentUser.todayRanking,
                        overallRanking : currentUser.overallRanking,
                        todayGameWon : true,
                        heart : heart,
                        timer : gameTimer,
                    }
                    updateStats(updatePlayerStats);
                }
                else {alert('try again!');}
                setIsValid(true);
            })
            
            let eventlist3 = resetbtn.current.addEventListener('click', ()=>{
                if( confirm("Are you sure!")==true){
                resetBoard();
                }else return;
            })
            
            return () => {
            removeEventListener('click',eventlist2);
            removeEventListener('click',eventlist3);
            }
        }, []);


        // handling side effects
        useEffect(()=>{ 
            const loginUser = async () => {
                // if(currentUser!=null)return;
                // if(sessionStorage.getItem('emailId')!=null)return;
                // console.log("inside login user : ");
                // console.log(oauthData);
                if(oauthData.name == null || oauthData.email==null) { console.log("oauth data not found!");return;}
                sessionStorage.setItem('username' , oauthData.name);
                sessionStorage.setItem('emailId',oauthData.email);
                sessionStorage.setItem('userImgLink',oauthData.picture);

                const getCurrentUserUrl = `https://sudokionode.onrender.com/api/v1/getCurrentUser`;
                const postCurrentUserUrl = `https://sudokionode.onrender.com/api/v1/postUser`;
                const currentUserObj = {emailId : oauthData.email , username : oauthData.name , userImgLink : oauthData.picture };
                // console.log(currentUserObj);
                const tempCurrentUser = await sendHTTPRequest(getCurrentUserUrl,'POST',currentUserObj);
                // console.log(tempCurrentUser);
                if(tempCurrentUser && tempCurrentUser.success==true){
                    setCurrentUser(tempCurrentUser.data);
                    sessionStorage.setItem('userId',tempCurrentUser.data._id)
                }else if(tempCurrentUser.error == 'cannot find user! or something went wrong!'){
                    const postNewUser = await sendHTTPRequest(postCurrentUserUrl,'POST',currentUserObj);
                    if(postNewUser.success == true){
                        setCurrentUser(postNewUser.data);
                        sessionStorage.setItem('userId',postNewUser.data._id)
                        console.log("User posted succesfully!");
                    }else{
                        console.log("something went wrong while posting new user!");
                    }
                }else{
                    console.log("some unknown server error occured!");
                }
            }
            loginUser();
        },[oauthData]);


        useEffect(()=>{
            console.log("all users  " , allUsers );
            console.log("currentusers  " , currentUser );
            if(sessionStorage.getItem('emailId')!=null || currentUser==null){
                console.log('setting current user~ ',allUsers.filter((elem)=> elem.emailId == sessionStorage.getItem('emailId'))[0]);
                setCurrentUser(()=>{return (allUsers.filter((elem)=> elem.emailId == sessionStorage.getItem('emailId')))[0]});
            }else if(sessionStorage.getItem('emailId')==null ){
                setCurrentUser(null);
            }
        },[allUsers]);
        
        useEffect(()=>{
            
            if(JSON.stringify(currentUser)!='{}' && currentUser!=undefined){
                // console.log("currentusers inside currentuser timer  " , currentUser );
                 setGameTimer(currentUser.timer);
                 setHeart(currentUser.heart);
                //  console.log("today game won : " , todayGameWon);
                 setTodayGameWon(currentUser.todayGameWon);
                 setGameOver(currentUser.gameOverToday);    
            }
            if(currentUser!=null)sessionStorage.setItem('userId',currentUser._id)
        },[currentUser]);

        // countDownTimer 
        useEffect(()=>{
                const countDownTimerFunction = ()=>{
                        if (gameStarted ==  false) {
                            clearInterval(timerInterval);
                            return;
                        }
                        const intervalId = setInterval(() => {
                        let timer = gameTimer;
                        timer.seconds+=1;
                        if(timer.seconds==60){
                            timer.seconds = 0;
                            timer.minutes += 1;
                            if(timer.minutes==60){
                                timer.hours = 1;
                                timer.minutes = 0;
                                timer.seconds = 0;
                                
                            }
                        }
                        setGameTimer({
                            hours : timer.hours,
                            minutes : timer.minutes,
                            seconds : timer.seconds
                        });
                        console.log(gameTimer);
                        if (timer.hours == 1) {
                            clearInterval(timerInterval);
                            setGameStarted(false);
                            console.log("game time is over!");   
                            alert('Game Over'); 
                            setGameOver(true);
                            updateGameOver();
                        }
                    }, 1000 );
                    setTimerInterval(intervalId);
                }
            countDownTimerFunction();
            return () => {
                clearInterval(timerInterval);
              };
        },[gameStarted]);


        useEffect(()=>{
            updateHeart();
            if(heart==0){
                setGameStarted(false);
                setGameOver(true);
                updateGameOver();
                alert('Game Over')
            }
        },[heart]);

        // small functions for various online competitive game environment
        const fetchBoard = async (date) => {
            // console.log(date);
            const getBoardUrl = `https://sudokionode.onrender.com/api/v1/getBoard`;
            let tempBoard = await sendHTTPRequest(getBoardUrl,'POST',{date : date});
            if(tempBoard && tempBoard.success==true){
                let newBoardData = tempBoard.data.board;
                setBoard(newBoardData);
                return true;
            }
            return false;
        }

        const postNewBoard = async (newBoard) => {
            const postBoardUrl =  `https://sudokionode.onrender.com/api/v1/postBoard`;
            console.log("inside post" , newBoard);
            let postResponse = await sendHTTPRequest(postBoardUrl,'POST',{
                board : newBoard,
                date : today
            });
            if(postResponse.success == false){
                console.log("Something went wrong while posting!");
            }else{
                console.log("board posted successfully!");
            }
        }

        const resetBoard = ()=>{
            setBoard((prevBoard)=>{
                return prevBoard.map((arr)=>{
                    return (arr).map(e=>{
                        if(e.fixed==false)return  { fixed : false, val: 0 }; 
                        return e;
                    })
                })
            });
            setIsValid(true);
        };

        const logOut = ()=>{
            if(isLeaderBoardClicked==true)setIsLeaderBoardClicked(false);
            if(isUserAccClicked==true)setIsUserAccClicked(false);
            setCurrentUser(null);
            hudRef.current.style.visibility  = 'visible';
            sessionStorage.clear();
            setGameOver(false);
            setGameTimer({hours:0,minutes:0,seconds:0});
            setHeart(3);
            setGameStarted(false);
            resetBoard();
        }

        const connectToServer = async ()=>{
            const getHealthApi = `https://sudokionode.onrender.com/api/v1/health`;
            const res = await sendHTTPRequest(getHealthApi,`GET`);
            if(res && res.success==true){
                console.log("returning true!");
                setIsConnected(true);
            }
        }

        
        const getLeaderBoard = async ()=>{
                const getAllUsersUrl = `https://sudokionode.onrender.com/api/v1/getUsers`;
                const tempAllUsers = await sendHTTPRequest(getAllUsersUrl , 'GET');
                
                if(tempAllUsers && tempAllUsers.success==true){
                    setAllUsers(tempAllUsers.data);
                }else{
                    console.log("Something went wrong while fetching all users!");
                    return;
                }
        }


        const updateRanking = async ()=>{
            // todayRanking
            const sortedByTodayRank = allUsers.sort((a,b)=>b.todayScore - a.todayScore);
            let updatedAllUsers;
            allUsers.map((user)=>{
                updatedAllUsers =  sortedByTodayRank.map((sortedUser,index)=>{
                    if(user.emailId == sortedUser.emailId){
                        user.todayRanking = index+1;
                        return user;
                    }
                })
            })
            const sortedByTotalRank = allUsers.sort((a,b)=>b.totalScore - a.totalScore);
            allUsers.map((user)=>{
                updatedAllUsers =  sortedByTotalRank.map((sortedUser,index)=>{
                    if(user.emailId == sortedUser.emailId){
                        user.totalRanking = index+1;
                        return user;
                    }
                })
            })
            const updateRankingUrl = `https://sudokionode.onrender.com/api/v1/patchManyUsers`;
            const updatedTodayRankingResponse = await sendHTTPRequest(updateRankingUrl , 'PATCH' , updatedAllUsers);
            if(updatedTodayRankingResponse.success==true){
                console.log(updatedTodayRankingResponse);
                console.log("ranking updated successfully!");
            }else{
                console.log("something went wrong while updating ranking!");
            }
        }

        const updateStats = async (updatePlayerStats) => {
                    const patchCurrentUserUrl = `https://sudokionode.onrender.com/api/v1/patchUserById/${currentUser._id}`;
                    const updatedStatsResponse = await sendHTTPRequest(patchCurrentUserUrl,'PATCH',updatePlayerStats);
                    if(updatedStatsResponse.success==true){
                        console.log("user stats updated successfully!");
                    }else{
                        console.log("something went wrong while updating user stats!");
                    }
        }

        const calculateScore = ()=>{
            let sum = 1;
            sum+=gameTimer.hours*60;
            sum+=gameTimer.minutes;
            sum+=(gameTimer.seconds/60);
            sum=Math.floor(sum);
            let currentScore = Math.floor((heart*500)/sum);
            console.log("current score ",currentScore);
            setNowGameScore(currentScore);
        }

        const updateHeart = async () => {
            if(currentUser==null)return;
            const  updateHeartUrl = `https://sudokionode.onrender.com/v1/patchUserById/${currentUser._id}`;
            const updatedHeart = await sendHTTPRequest(updateHeartUrl , 'PATCH' , {heart : heart});
            if(updateHeart &&  updatedHeart.success == true){
                console.log("heart updated successfully");
            }else{
                console.log("something went wrong while updating heart!");
            }
        }

        const updatePausedGame = async ()=> {
            console.log("inside pause game ",todayGameWon);
            if(currentUser==null){ setGameStarted(!gameStarted); return;};
            if(todayGameWon)
            {
                alert("You have already won today's Game!");
                return;
            }else if(gameOver){
                alert("Your chances have finished for today! try again tomorrow!");
                return;
            }else{
                 setGameStarted(!gameStarted);
                 if(gameStarted==false){
                    const updateTimerUrl = `https://sudokionode.onrender.com/api/v1/patchUserById/${currentUser._id}`;
                    let updatedTimer = await sendHTTPRequest(updateTimerUrl , `PATCH` , {timer : gameTimer});
                    console.log(updatedTimer);
                    if(updatedTimer && updatedTimer.success==false){
                        console.log("something went wrong while updating timer!");
                    }else if(updatedTimer &&  updatedTimer.success==true){
                        console.log("timer updated successfully!");
                    }else{
                        console.log("something else went wrong");
                    }
                 }
            } 
        }

        const updateGameOver = async ()=>{
            if(gameStarted==false){
                const updateGameOver = `https://sudokionode.onrender.com/api/v1/patchUserById/${currentUser._id}`;
                let updatedGameOver = await sendHTTPRequest(updateGameOver , `PATCH` , {gameOverToday : true});
                console.log(updatedGameOver);
                if(updatedGameOver && updatedGameOver.success==false){
                    console.log("something went wrong while updating game over!");
                }else if(updatedGameOver &&  updatedGameOver.success==true){
                    console.log("update Game Over updated successfull!");
                }else{
                    console.log("something else went wrong");
                }
             }
        }




    // board generation logics
        const generateRandomValue = () => Math.floor(Math.random() * 9) + 1;

        // function to generate random numbers
        function r(a){
            return Math.floor(Math.random() * a) + 1;
        }

        // function to check the positional correctness
        function isSafe(board , row, col, val){
            for(let i=0;i<board.length;i++){
                if(board[i][col].val==val)return false;
            }
            for(let i=0;i<board[0].length;i++){
                if(board[row][i].val==val)return false;
            }
            for(let i=row-row%3;i<(row-row%3)+3;i++){
                for(let j=col-col%3;j<(col-col%3)+3;j++){
                    if(board[i][j].val==val)return false;
                }
            }
            return true;
        }


        // backtracking function that solves the puzzle
        function Solve( board, row, col){
            console.log("inside solve fun : ");
            if(row==board.length-1 && col==board[0].length)return true;
            if(col==board[0].length){row++;col=0;}
            if(board[row][col].val!=0)return Solve(board,row,col+1);
            for(let i=1;i<=board.length;i++){
                let obj = new Object({
                    val : i,
                    fixed : true
                })  
                if(isSafe(board,row,col,i)){
                    board[row][col] = obj;
                    if(Solve(board,row,col+1)){printBoard(board);return true;}
                    
                }
                board[row][col] = { val: 0, fixed: false };
            }
            return false;
        }


        // main function that does all the sub functions
        function sudokuGame() {
            const newBoard = Array.from({ length: 9 }, (_, i) =>
              Array.from({ length: 9 }, (_, j) => ({
                val: 0,
                fixed: false,
              }))
            );
            newBoard[0][0] = { val: generateRandomValue(), fixed: true };
            newBoard[8][8] = { val: generateRandomValue(), fixed: true };          
            // Solve the Sudoku puzzle
            Solve(newBoard, 0, 0);
            console.log('printing sudoku board : ');
            setBoard(newBoard);
            for(let i=0;i<(newBoard.length*newBoard[0].length)/2;i++){
                    let x = r(8);
                    let y = r(8);
                    if(newBoard[x][y]==0)i--;
                    else{
                        newBoard[x][y]={val:0,fixed:false};
                    }
                }
            // posting the newly genereated board:
            postNewBoard(newBoard);
          }

        // Partially solved sudoku generated
        
        // function that finally verifies the users gameplay
        function verifySudoku(){
            for(let i=0;i<board.length;i++){
                for(let j=0;j<board[0].length;j++){
                    let val = board[i][j].val;
                    if(val===0 || isfinalSafe(board,i,j,val)==false ){console.log("val : ",val,"isValid: ",isValid);setIsValid(false);return;}
                }
                if (!isValid) {
                    return;
                  }
            }
            setIsValid(true);
        }

        function isfinalSafe(board , row, col, val){
            for(let i=0;i<board.length;i++){
                if( i!=row && board[i][col].val==val)return false;
            }
            for(let i=0;i<board[0].length;i++){
                if(i!=col && board[row][i].val==val)return false;
            }
            for(let i=row-row%3;i<(row-row%3)+3;i++){
                for(let j=col-col%3;j<(col-col%3)+3;j++){
                    if(!(i==row && j==col) && board[i][j].val==val)return false;
                }
            }
            return true;
        }
                

        // function to print the sudoku
        function printBoard( board){
            for(let i=0;i<board.length;i++){
                let str = "";
                for(let j=0;j<board[0].length;j++){
                    str+=board[i][j].val + " ";
                }
                console.log(str);
            }
        }
    


        return  (
            <>
                {(isLeaderBoardClicked==true)?<LeaderBoard allUsers={allUsers} setIsLeaderBoardClicked={setIsLeaderBoardClicked} currentUser={sessionStorage.getItem('username')} hudRef={hudRef}/>:''}
                {(isUserAccClicked==true)?<UserAccountScreen user={currentUser} setIsUserAccClicked={setIsUserAccClicked} logOut={logOut} hudRef={hudRef}/>:''}
                <div className="navBar">
                    <h1>Sudoku</h1>
                    <div className="online">
                        {(currentUser==null || currentUser==undefined)?
                            <div className="loginWithGoogle">
                            <LoginSocialGoogle
                                        client_id={import.meta.env.VITE_SUDOKIO_CLIENTID}
                                        scope="openid profile email"
                                        discoveryDocs="claims_supported"
                                        access_type="offline"
                                        onResolve={({ provider, data }) => {
                                            // console.log(provider);
                                            console.log(data);
                                            setOauthData(data);
                                        }}
                                        onReject={(err) => {
                                            console.log(err);
                                        }}
                                    >
                                <div className="googleBtn"><img src={googleImg} alt="google" height={30} width={30} /><span id="loginWord">Login</span></div>
                            </LoginSocialGoogle>
                        </div>
                        :
                            <div className="userAccBtn" onClick={()=>{if(isLeaderBoardClicked==true){setIsLeaderBoardClicked(false);}setIsUserAccClicked(true);hudRef.current.style.visibility = 'hidden'}}>
                                <img src={sessionStorage.getItem('userImgLink')} alt="user" height={50} width={50} />
                            </div>        
                        }
                        <div className="leaderBoard" onClick={()=>{if(isUserAccClicked==true){setIsUserAccClicked(false);}setIsLeaderBoardClicked(true);hudRef.current.style.visibility = 'hidden';}}> <img src={leaderBoardImg} alt="leaderBoard" height={40} width={40} /></div>
                    </div>
                </div>

                {(isConnected)? '' : <h3>Connecting to server!</h3>}

                <div className="hud" ref={hudRef}>
                        <div className="hudLeft" >
                            <div className="timer" > {gameTimer.hours +  " : " + gameTimer.minutes + " : " + gameTimer.seconds} </div>
                        </div>
                        <div className="pauseBtn" onClick={()=>{updatePausedGame();}} >
                            {    (gameStarted)?
                                    <img src={pauseImg} alt="pause" height={40} width={40} />
                                :                            
                                    <img src={playImg} alt="play" height={40} width={40} />
                            }
                        </div>
                        <div className="hudRight" >
                            <div className="heart"  style={{backgroundColor:(heart>=1)?'var(--fixed-color)':'var(--text-color)'}}></div>
                            <div className="heart"  style={{backgroundColor:(heart>=2)?'var(--fixed-color)':'var(--text-color)'}}></div>
                            <div className="heart" style={{backgroundColor:(heart==3)?'var(--fixed-color)':'var(--text-color)'}} ></div>
                        </div>
                </div>
                <div className="pagewrap">
                    <div className="left">
                        <div className="sudokubox" ref={sudoku}>
                                {board.map((row, rowIndex) => (
                                    row.map((elem, colIndex) => (
                                        <SudokuElem 
                                        key={`${rowIndex}-${colIndex}`}
                                        elem={elem} 
                                        style={(currX==rowIndex && currY==colIndex)?'var(--hover-color)':'var(--change-color)'}
                                        onclick={()=>{             
                                            setCurrx(rowIndex);
                                            setCurry(colIndex);
                                            }}
                                        />
                                        ))
                                    ))}
                            <div className="pauseCover" style={{display:(gameStarted)?'none':'flex'}}>
                                <img src={pauseImg} alt="paused" height={50} width={50} />
                            </div>
                        </div>
                        <div className="btns">
                            <div className="submitbtn" ref={submitbtn}>
                                submit
                            </div>
                            <div className="resetbtn" ref={resetbtn}>
                                reset
                            </div>
                        </div>
                    </div>
                    
                        <div className="right">
                            {Array.from({ length: 9 }, (_, i) => (
                                <SelectElem 
                                key={i} 
                                val={i + 1}
                                onclick = {()=>{           
                                    if(board[currX][currY].fixed==false &&  currX!=0 && currY!=0){
                                    if(isSafe(board,currX,currY,i+1)==false){
                                        if(heart>0)
                                        setHeart(heart-1);
                                    }
                                    board[currX][currY].val = i+1;
                                    setBoard(board);
                                }
                                setCurrx(0);setCurry(0)}}
                                />
                            ))}
                        </div>
                </div>
            </>
        )
    }

    export default SudokuGame;
