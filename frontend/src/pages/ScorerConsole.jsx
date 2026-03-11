import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScorerConsole = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [batter1, setBatter1] = useState(null);
    const [batter2, setBatter2] = useState(null);
    const [bowler, setBowler] = useState(null);

    // Fetch match data on component mount
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await axios.get(`https://eidcricketfest-1.onrender.com/api/matches/${id}/live-score`);
                setMatch(res.data);
                
                // Get scorecard for player info
                const scorecardRes = await axios.get(`https://eidcricketfest-1.onrender.com/api/matches/${id}/scorecard`);
                const scoreData = scorecardRes.data;
                
                // Set initial batters and bowler
                if (scoreData.batting && scoreData.batting.length > 0) {
                    setBatter1(scoreData.batting[0]);
                    if (scoreData.batting.length > 1) {
                        setBatter2(scoreData.batting[1]);
                    }
                }
                if (scoreData.bowling && scoreData.bowling.length > 0) {
                    setBowler(scoreData.bowling[0]);
                }
                
                // Set initial score
                setScore({
                    runs: res.data.currentRuns || 0,
                    wickets: res.data.currentWickets || 0,
                    overs: parseInt(res.data.overs?.split('.')[0] || 0),
                    balls: parseInt(res.data.overs?.split('.')[1] || 0)
                });
            } catch (err) {
                setError('Failed to load match data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) fetchMatch();
    }, [id]);

    // Handle recording a delivery
    const recordDelivery = async (runs, isWicket = false) => {
        try {
            const deliveryData = {
                runs: runs,
                isWicket: isWicket,
                isWide: false,
                isNoBall: false,
                isBye: false,
                isLegBye: false
            };
            
            await axios.post(`https://eidcricketfest-1.onrender.com/api/matches/${id}/deliveries`, deliveryData);
            
            // Update score
            const newBalls = score.balls + 1;
            const newOvers = score.overs + (newBalls === 6 ? 1 : 0);
            const finalBalls = newBalls === 6 ? 0 : newBalls;
            
            setScore({
                runs: score.runs + runs,
                wickets: isWicket ? score.wickets + 1 : score.wickets,
                overs: newOvers,
                balls: finalBalls
            });
        } catch (err) {
            setError('Failed to record delivery');
            console.error(err);
        }
    };

    // Handle undo last delivery
    const undoLastBall = async () => {
        try {
            await axios.delete(`https://eidcricketfest-1.onrender.com/api/matches/${id}/deliveries/latest`);
            
            // Recalculate overs/balls
            let totalBalls = score.overs * 6 + score.balls - 1;
            const newOvers = Math.floor(totalBalls / 6);
            const newBalls = totalBalls % 6;
            
            setScore({
                ...score,
                overs: newOvers,
                balls: newBalls
            });
        } catch (err) {
            setError('Failed to undo delivery');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-black text-white font-space flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🏏</div>
                    <div className="text-white/60 uppercase tracking-widest font-black">Loading Match...</div>
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="w-full min-h-screen bg-black text-white font-space flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6">⚠️</div>
                    <div className="text-2xl font-black uppercase tracking-[2px] mb-3">{error || 'Match Not Found'}</div>
                    <button onClick={() => navigate('/draft')} className="mt-6 px-8 py-3 bg-white text-black font-bold uppercase tracking-[1px] hover:bg-slate-200 transition-colors rounded">
                        Back to Admin
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-black text-white font-space p-4 md:p-8 flex flex-col">
            {/* Header / Match Status */}
            <div className="flex flex-col border border-white/20 p-6 mb-8 mt-16 relative">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-white/40 text-xs font-bold tracking-[4px] uppercase">{match.team1Name} VS {match.team2Name}</span>
                    <div className="bg-white text-black px-2 py-0.5 text-[10px] font-black tracking-widest uppercase">LIVE</div>
                    <span className="text-white/40 text-xs font-bold tracking-[4px] uppercase">INNINGS {match.inning}</span>
                </div>

                <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-[80px] md:text-[120px] font-black leading-none tracking-tighter mb-2">
                        {score.runs} / {score.wickets}
                    </div>
                    <div className="text-xl md:text-3xl font-bold tracking-[8px] text-white/60">
                        OVERS: {score.overs}.{score.balls}
                    </div>
                </div>
            </div>

            {/* Middle Section / Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Batters */}
                <div className="border border-white/20 p-6 flex flex-col gap-4">
                    <h3 className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-2">BATSMEN</h3>
                    <div className="flex justify-between items-center bg-white/5 p-4 border-l-2 border-white">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold uppercase tracking-wider">{batter1?.name || 'Batter 1'}</span>
                            <span className="text-white font-black">*</span>
                        </div>
                        <div className="font-black text-lg">{batter1?.runs || 0} <span className="text-sm text-white/40 font-medium">({batter1?.balls || 0})</span></div>
                    </div>
                    <div className="flex justify-between items-center p-4 border-l-2 border-transparent">
                        <span className="text-white/60 font-bold uppercase tracking-wider">{batter2?.name || 'Batter 2'}</span>
                        <div className="font-black text-lg text-white/60">{batter2?.runs || 0} <span className="text-sm font-medium">({batter2?.balls || 0})</span></div>
                    </div>
                </div>

                {/* Bowler */}
                <div className="border border-white/20 p-6 flex flex-col gap-4">
                    <h3 className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-2">CURRENT BOWLER</h3>
                    <div className="flex justify-between items-center bg-white/5 p-4 border-r-2 border-white">
                        <span className="text-white font-bold uppercase tracking-wider">{bowler?.name || 'Bowler'}</span>
                        <div className="font-black text-lg text-right">
                            {bowler?.wickets || 0}-{bowler?.runs || 0} <span className="text-sm text-white/40 font-medium">({bowler?.overs || 0})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Pad */}
            <div className="flex flex-col gap-4 flex-grow max-w-4xl mx-auto w-full">
                {/* Runs Row */}
                <div className="grid grid-cols-6 gap-2">
                    {['0', '1', '2', '3', '4', '6'].map((val) => (
                        <button
                            key={val}
                            onClick={() => recordDelivery(parseInt(val), false)}
                            className="aspect-square border border-white/40 flex items-center justify-center text-2xl font-black hover:bg-white hover:text-black transition-all active:scale-95"
                        >
                            {val}
                        </button>
                    ))}
                </div>

                {/* Extras Row */}
                <div className="grid grid-cols-4 gap-2">
                    {['WIDE', 'NO BALL', 'BYE', 'LEG BYE'].map((ext) => (
                        <button
                            key={ext}
                            onClick={() => recordDelivery(1, false)}
                            className="py-4 border border-white/20 text-[10px] font-black tracking-[2px] uppercase hover:bg-white hover:text-black transition-all active:scale-95"
                        >
                            {ext}
                        </button>
                    ))}
                </div>

                {/* Game Changers */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => recordDelivery(0, true)}
                        className="py-6 bg-white text-black text-xl font-black tracking-[4px] uppercase hover:bg-black hover:text-white hover:border-white transition-all active:scale-95 border-2 border-white">
                        WICKET
                    </button>
                    <button 
                        onClick={undoLastBall}
                        className="py-6 border-2 border-white text-white text-sm font-black tracking-[2px] uppercase hover:bg-white/10 transition-all active:scale-95">
                        UNDO LAST BALL
                    </button>
                </div>
            </div>

            {/* Simple back navigation */}
            <div className="mt-12 text-center">
                <a href="/draft" className="text-white/20 text-[10px] font-bold tracking-[4px] uppercase hover:text-white transition-colors">
                    RETURN TO DRAFT
                </a>
            </div>
        </div>
    );
};

export default ScorerConsole;
