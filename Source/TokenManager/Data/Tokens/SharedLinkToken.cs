﻿using System.Collections.Generic;
using System.Collections.Specialized;
using Sitecore.Data;
using Sitecore.Data.Fields;
using TokenManager.Data.Interfaces;
using TokenManager.Data.TokenDataTypes;
using TokenManager.Data.TokenDataTypes.Support;
using TokenManager.Management;

namespace TokenManager.Data.Tokens
{
	public class SharedLinkToken : SitecoreBasedToken
	{
		public SharedLinkToken(string name, ID backingId) : base(name, backingId)
		{
		}

		public override string Value(TokenDataCollection extraData)
		{
			LinkField f = TokenKeeper.CurrentKeeper.GetDatabase().GetItem(BackingId).Fields["Link"];
			return string.Format("<a href='{0}' target='{1}' class='{2}' title='{3}'>{4}</a>", f.GetFriendlyUrl(), f.Target,
				f.Class, f.Title, extraData["Link Text"]);
		}

		public override IEnumerable<ITokenData> ExtraData()
		{
			yield return new StringTokenData("Text", "Link Text", "Enter the text that will appear as the link", true);
		}


	}
}
