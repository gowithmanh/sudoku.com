import './LeaderBoardListElement.css'
import fireIcon from '../assets/fire.svg'
// lottie icon 
import lottie from 'lottie-web';
import { defineElement } from 'lord-icon-element';

defineElement(lottie.loadAnimation);
function LeaderBoardListElement({username , ranking , score,currentUser,elem,clickedUser,setClickedUser }){
    
    const handleClickedUser = ()=>{
        console.log(elem);
        console.log(clickedUser);
        if(JSON.stringify(clickedUser)!='{}'){
            setClickedUser({});
        }else{
            console.log("here");
            setClickedUser(elem);
        }
    }

    return (
        <div  onClick={()=>{handleClickedUser()}}>
            
            {(clickedUser && elem && clickedUser.username === elem.username)?
                 (<div className="clickedWrapper">
                            {(ranking==1)?
                                <div className="confettiInsideClickedWrapper">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/xxdqfhbi.json"
                                        trigger="loop"
                                        colors="primary:#121331,secondary:#ffc738,tertiary:#4bb3fd"
                                        style={{width:'90px',height:'90px'}}
                                        >
                                    </lord-icon>
                                </div>:''
                            }
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft"> Username  </div><div className="clickedUserRight">  {elem.username}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Over All Ranking </div> <div className="clickedUserRight">  {clickedUser.overallRanking}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Total Score </div> <div className="clickedUserRight">   {clickedUser.totalScore}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Today Ranking </div> <div className="clickedUserRight">  {clickedUser.todayRanking}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Today Score </div>  <div className="clickedUserRight">   {clickedUser.todayScore}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Sudoku's Cleared </div><div className="clickedUserRight">  {clickedUser.numberOfGamesPlayed}</div>
                            </div>
                            <div className="clickedUserListItem">
                                <div className="clickedUserLeft">Streak  </div><div className="clickedUserRight" style={{fontSize:'x-large'}}>  {clickedUser.streak} {(clickedUser.streak!=0)? <img src={fireIcon} alt="fire" height={30} width={30} style={{marginLeft:'0.5vw'}}/>:''}</div>
                            </div> 
                    </div>)
                :   
                (<div className="unclickedWrapper">
                    <div className="leaderBoardListWrapper" style={{backgroundColor:(currentUser==username)?'var(--secondary-color)':'var(--primary-color)',border:(ranking==1)?'2px solid var(--secondary-text-color)':''}}>
                        <div className="LeaderBoardUsername">
                            {username}
                        </div>
                    <div className="separatorListLeaderBoard"></div>
                        <div className="LeaderBoardRanking">
                            {ranking}
                            {(ranking==1)?
                                <div className="confetti">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/xxdqfhbi.json"
                                        trigger="loop"
                                        colors="primary:#121331,secondary:#ffc738,tertiary:#4bb3fd"
                                        style={{width:'50px',height:'30px'}}
                                        >
                                    </lord-icon>
                                </div>:''
                            }
                        </div>
                    <div className="separatorListLeaderBoard"></div>
                        <div className="LeaderBoardScore">
                            {score}
                        </div>
                    </div>
                </div>)

            }
        </div>
    )
}

export default LeaderBoardListElement;