import { TILE_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
export const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q'];

const lineTiles = (horizontal, dim = false) => {
    const values = horizontal ? letters : numbers;
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexDirection: horizontal ? 'row' : 'column',
            }}
        >
            {
                !horizontal && (
                    <div
                        style={{
                            marginTop: TILE_SIZE,
                        }}
                    />
                )
            }
            {
                values.map((val, i) => (
                    <div
                        key={`tile-${val}-${horizontal}-${dim}`}
                        style={{
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ccf',
                            fontSize: 16,
                            opacity: dim ? 0.25 : 1.0,
                        }}
                    >
                        {/*{val}*/}
                        {i}
                    </div>
                ))
            }
        </div>
    )
}

export default function RenderMap(props) {
    const { background } = props.map;
    const width = TILE_SIZE * BOARD_WIDTH;
    const height = TILE_SIZE * BOARD_HEIGHT;

    return (
        <div
            style={{
                position: 'absolute',
                width: width + (TILE_SIZE * 2),
                height: height + (TILE_SIZE * 2),
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: width + (TILE_SIZE * 2),
                    height: height + (TILE_SIZE * 2),
                }}
            >
                { lineTiles(false) }
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width,
                    }}
                >
                    { lineTiles(true) }
                    <img
                        src={background}
                        alt="The RenderMap"
                        width={width}
                        height={height}
                    />
                    { lineTiles(true, true) }
                </div>
                { lineTiles(false, true) }
            </div>
        </div>
    )
}