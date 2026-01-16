import axios from 'axios';

async function SimulateFGTS({ url, cpf, feeScheduleId, player, accessToken, timeout = 30_000 }) {
    return axios.post(
        url,
        {
            clientCpf: cpf,
            feeScheduleId: feeScheduleId,
            player: player
        },
        {
            timeout: timeout,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
}

export default SimulateFGTS;