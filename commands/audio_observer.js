const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, EndBehaviorType } = require('@discordjs/voice');
const Prism = require('prism-media');
const { PassThrough } = require('stream');
const cmdName = 'audio_observer';
let stopFlg = false;
const userVolumes = {}; // ユーザーごとの音量記録用

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription('音量計測を開始'),
    async execute(interaction, client1, client2, connections, message) {
        const command = interaction.client.commands.get(cmdName);
        stopFlg = false;
        const connection1 = getVoiceConnection(interaction.guildId, 'listener');
        const connection2 = getVoiceConnection(interaction.guildId, 'speaker');
        if (connection1 && connection2) {
            const startTime = Date.now();
            userVolumes.start = startTime;

            const handleUserSpeakingStart = async (userId, connection) => {
                const audio = connection.receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 100,
                    },
                });

                const rawStream = new PassThrough();
                audio.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })).pipe(rawStream);

                rawStream.on('data', (chunk) => {
                    let sum = 0;
                    let samples = chunk.length / 2;
                    for (let i = 0; i < chunk.length; i += 2) {
                        let sample = chunk.readInt16LE(i);
                        sum += sample * sample;
                    }
                    let rms = Math.sqrt(sum / samples);

                    if (!userVolumes[userId]) {
                        userVolumes[userId] = { max: 0, sum: 0 };
                    }
                    if (rms > userVolumes[userId].max) {
                        userVolumes[userId].max = rms;
                    }
                    userVolumes[userId].sum += rms;
                    // dB変換はここでは行わない
                });

                rawStream.on('end', () => {
                    console.log(`${userId} End`);
                    cleanupUser(userId, rawStream, command, connection, handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd);
                });

                rawStream.on('error', (error) => {
                    console.error('Stream error:', error);
                    cleanupUser(userId, rawStream, command, connection, handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd);
                });
            };

            const handleReceiverError = (error) => {
                console.log('handleReceiverError :', error);
            };

            const handleUserSpeakingEnd = async (userId) => {
                //console.log(`${userId} End`);
            };

            command.restart(connection1, (userId) => handleUserSpeakingStart(userId, connection1), handleReceiverError, handleUserSpeakingEnd);
            command.restart(connection2, (userId) => handleUserSpeakingStart(userId, connection2), handleReceiverError, handleUserSpeakingEnd);

            message = '計測を開始します。';
            command.reply(interaction, message);
            return command.returnObj(interaction, connection1, connection2, message);
        } else {
            message = 'VCに接続してください';
            command.reply(interaction, message);
            return command.returnObj(interaction, null, null, null, message);
        }
    },
    async reply(interaction, message) {
        if (interaction.commandName === cmdName) {
            await interaction.reply(message);
        }
    },
    async returnObj(interaction, connection1, connection2, message) {
        if (interaction.commandName === cmdName) {
            return [connection1, connection2];
        } else {
            return [connection1, connection2, message];
        }
    },
    async restart(connection, handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd) {
        if (!stopFlg) {
            connection.receiver.speaking.on('start', handleUserSpeakingStart);
            connection.receiver.speaking.on('error', handleReceiverError);
            connection.receiver.speaking.on('end', handleUserSpeakingEnd);
        }
    },
    async stop() {
        stopFlg = true;
        Object.keys(userVolumes).forEach(key => delete userVolumes[key]);
    },
    async returnResult() {
        const endTime = Date.now();
        userVolumes.end = endTime;
        return JSON.parse(JSON.stringify(userVolumes));
    },
};

function cleanupUser(userId, rawStream, command, connection, handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd) {
    rawStream.destroy();
    connection.receiver.speaking.removeAllListeners();
    command.restart(connection, (userId) => handleUserSpeakingStart(userId, connection), handleReceiverError, handleUserSpeakingEnd);
}
