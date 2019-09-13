export class DevlibTSUtil {

	public static async asyncSetTimeout(f: Function, milliDelay: number): Promise<any>
	{
		return  new Promise((resolve) =>
		{
			setTimeout(
				() =>
				{
					f();
					resolve();
				},
				milliDelay
			);
		});
	}

	public static async makeAsync(f: Function): Promise<any>
	{
		return DevlibTSUtil.asyncSetTimeout(f, 0);
	}

}