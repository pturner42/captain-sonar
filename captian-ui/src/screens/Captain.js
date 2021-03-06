import { useState, useEffect } from 'react';
import {
    Button,
} from '@mui/material';
import {
    Favorite as Heart,
    FavoriteBorder as EmptyHeart,
} from '@mui/icons-material';
import {
    Jobs,
    MessageTypes,
    TILE_SIZE,
    Directions,
    MAP_WIDTH,
    MAP_HEIGHT,
    getBadLocations,
    getCurrentLoc,
} from '../constants';
import Grid from '../components/Grid';
import RenderMap from '../components/RenderMap';
import CaptainMap from '../components/toolbelt/CaptainMap';
import ToolBelt from '../components/toolbelt/ToolBelt';
import { convertServerPath } from '../components/Path';
import ConfirmSelection from '../components/Confirm';
import SystemChoices from '../components/toolbelt/SystemChoices';
import {getDefaultMap} from '../components/Map';
import PauseActionScreen from './PauseActionScreen';

export default function Captain(props) {
    const {
        boardWidth,
        boardHeight,
        myTeam,
        enemyTeam,
        sendMessage,
        mapNbr,
        pauseAction,
    } = props;

    const [placementCol, setPlacementCol] = useState(myTeam.currentShipPath.startCol);
    const [placementRow, setPlacementRow] = useState(myTeam.currentShipPath.startRow);
    const [map, setMap] = useState(getDefaultMap(mapNbr));

    useEffect(() => {
        setMap(getDefaultMap(mapNbr));
    }, [mapNbr]);

    const { startSelected } = myTeam;
    const { startSelected: enemyStartSelected } = enemyTeam;
    const { pendingMove } = myTeam;
    const shipPath = convertServerPath(myTeam.currentShipPath);
    const [
        currentCol,
        currentRow,
    ] = getCurrentLoc(myTeam.currentShipPath);

    const badLocations = getBadLocations(myTeam, map);

    const possibleMineLocations = [];
    for (let r=-1; r<=1; r++) {
        for (let c=-1; c<= 1; c++) {
            const col = currentCol + c;
            const row = currentRow + r;
            let active = true;
            for (const badLoc of badLocations) {
                if (col === badLoc[0] && row === badLoc[1]) {
                    active = false;
                    break;
                }
            }
            if (active) {
                possibleMineLocations.push([col, row]);
            }
        }
    }

    const dirs = [
        {
            dir: Directions.North,
            move: [0, -1],
        },
        {
            dir: Directions.South,
            move: [0, 1],
        },
        {
            dir: Directions.East,
            move: [1, 0],
        },
        {
            dir: Directions.West,
            move: [-1, 0],
        },

    ]
    const disabledDirections = [];
    for (const badLoc of badLocations) {
        for (const directionObj of dirs) {
            const {
                dir,
                move,
            } = directionObj;
            if (badLoc[0] === currentCol + move[0] && badLoc[1] === currentRow + move[1]) {
                disabledDirections.push(dir);
                break;
            }
        }
    }


    const markerSize = 20;

    const width = MAP_WIDTH + (TILE_SIZE * 2);
    const height = MAP_HEIGHT + (TILE_SIZE * 2);

    const clickMap = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newCol = Math.floor((x / MAP_WIDTH) * (TILE_SIZE / 2));
        const newRow = Math.floor((y / MAP_HEIGHT) * (TILE_SIZE / 2));
        for (const badLoc of badLocations) {
            if (newCol === badLoc[0] && newRow === badLoc[1]) {
                return;
            }
        }
        setPlacementCol(newCol);
        setPlacementRow(newRow);
        sendMessage(
            MessageTypes.SET_START,
            {
                startCol: newCol,
                startRow: newRow,
            }
        )
    }

    const enableActions = !pauseAction && !myTeam.surfaced && !pendingMove && startSelected && enemyStartSelected;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            <div
                style={{
                    width,
                    height,
                    border: '10px solid #853',
                    borderRadius: 5,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden',
                }}
            >
                <RenderMap
                    map={map}
                />
                <div
                    style={{
                        marginLeft: TILE_SIZE,
                        marginTop: TILE_SIZE,
                    }}
                >
                    <Grid
                        width={boardWidth}
                        height={boardHeight}
                        path={shipPath}
                        hidePath={!startSelected}
                        boardMargin={0}
                        lineColor={myTeam.surfaced ? '#aaa': '#444'}
                        onMouseDown={startSelected ? undefined : clickMap}
                    />
                    {
                        myTeam.mines.map((mine) => (
                            <div
                                key={`mine-${mine[0]}-${mine[1]}`}
                                style={{
                                    position: 'absolute',
                                    left: TILE_SIZE + (TILE_SIZE * mine[0]) + (TILE_SIZE / 2) - (markerSize / 2),
                                    top: TILE_SIZE + (TILE_SIZE * mine[1]) + (TILE_SIZE / 2) - (markerSize / 2),
                                    width: markerSize - 10,
                                    height: markerSize - 10,
                                    borderStyle: 'solid',
                                    borderWidth: 5,
                                    borderColor: 'red',
                                    borderRadius: markerSize,
                                    cursor: enableActions ? 'pointer' : undefined,
                                }}
                                onClick={() => {
                                    if (enableActions) {
                                        sendMessage(
                                            MessageTypes.TRIGGER_MINE,
                                            {
                                                col: mine[0],
                                                row: mine[1],
                                            }
                                        )
                                    }
                                }}
                            />
                        ))
                    }
                    {
                        !startSelected && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: TILE_SIZE + (TILE_SIZE * placementCol) + (TILE_SIZE / 2) - (markerSize / 2),
                                    top: TILE_SIZE + (TILE_SIZE * placementRow) + (TILE_SIZE / 2) - (markerSize / 2),
                                    width: markerSize - 10,
                                    height: markerSize - 10,
                                    borderStyle: 'solid',
                                    borderWidth: 5,
                                    borderColor: 'lime',
                                    borderRadius: markerSize,
                                }}
                            />
                        )
                    }
                </div>
                {
                    !!pauseAction && (
                        <PauseActionScreen
                            myTeam={myTeam}
                            enemyTeam={enemyTeam}
                            pauseAction={pauseAction}
                            sendMessage={sendMessage}
                            map={map}
                            possibleMineLocations={possibleMineLocations}
                        />
                    )
                }
            </div>
            <ToolBelt>
                <CaptainMap active={enableActions} pendingDirection={pendingMove && pendingMove.direction} sendMessage={sendMessage} disabledDirections={disabledDirections} />
                <SystemChoices
                    team={myTeam}
                    enableActions={enableActions && !myTeam.hasFired}
                    clickable
                    sendMessage={sendMessage}
                />
                <div
                    style={{
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            borderWidth: 2,
                            borderRadius: 30,
                            borderColor: '#444',
                            borderStyle: 'solid',
                            margin: 5,
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <span>Ship</span>
                        <div>
                            {
                                [1,2,3,4].map((health) => {
                                    if (health <= myTeam.health) {
                                        return <Heart key={`health-${health}-y`} style={{ color: 'pink' }} />
                                    } else {
                                        return <EmptyHeart key={`health-${health}-n`} style={{ color: 'gray' }} />
                                    }
                                })
                            }
                        </div>
                        <Button
                            disabled={!enableActions || myTeam.currentShipPath.path.length === 0}
                            variant="contained"
                            style={{ marginBottom: 5 }}
                            onClick={() => sendMessage(MessageTypes.SURFACE)}
                        >
                            Surface
                        </Button>
                    </div>
                </div>
                {
                    !!myTeam.surfaced && (
                        <span>Currently Surfaced</span>
                    )
                }
                {
                    (!startSelected || !!pendingMove) &&
                        <ConfirmSelection text={pendingMove ? 'Undo' : 'Dive!'} job={Jobs.CAPTAIN} sendMessage={sendMessage} />
                }
            </ToolBelt>
        </div>
    )
}