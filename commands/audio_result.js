const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const cmdName = 'audio_result';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('リザルトを表示。'),
	async execute(interaction, client1, client2,  connections,message) {
		const command = interaction.client.commands.get(cmdName);
		const [connection1, connection2] = connections;

		message = '結果が取得できませんでした。'

		//イベントの新規作成を停止
		const startCommand = interaction.client.commands.get('audio_observer');
		result = await startCommand.returnResult();
		await startCommand.stop();

		if(result !== undefined && result !== null){
			message = '';
			const duration = result.end - result.start;
			const avgBase = duration / 20;

			for (const key of Object.keys(result)) {
			    if (key !== 'start' && key !== 'end') {
			        const maxRms = result[key].max;
			        const sumRms = result[key].sum;
			        const avgRms = sumRms / avgBase;

			        // 90dBを最大値として換算
			        const maxDb = 90 + 20 * Math.log10(maxRms / 32767);
			        const avgDb = 90 + 20 * Math.log10(avgRms / 32767);

			        try {

						// サーバーメンバー情報を取得
    					const member = await interaction.guild.members.fetch(key);
    					// サーバーニックネーム（なければユーザー名）
						const displayName = member.displayName || member.user.globalName || member.user.username;
						message += `${displayName} 最大値: ${Math.trunc(maxDb)}DB 平均値: ${Math.trunc(avgDb)}DB\n`;
			        } catch (e) {
			            message += `${key} 最大値: ${Math.trunc(maxDb)}DB 平均値: ${Math.trunc(avgDb)}DB\n`;
			        }
			    }
			}
		}
		console.log(message)
		command.reply(interaction, message);
		return [connection1, connection2] ;
	},
	async reply(interaction, message ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(message);
		}
	},
};