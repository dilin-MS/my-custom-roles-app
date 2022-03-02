const fetch = require('node-fetch').default;

// add role names to this object to map them to group ids in your AAD tenant
const roleGroupMappings = {
    'admin': '997c67da-4c66-485e-8925-97e405ccd501',
    'reader': '997c67da-4c66-485e-8925-97e405ccd501'
};

module.exports = async function (context, req) {
    console.log("[dilin-debug] ### Calling /api/getRoutes function ###");
    console.log("[dilin-debug] req:" + JSON.stringify(req));

    const user = req.body || {};
    const roles = [];
    
    for (const [role, groupId] of Object.entries(roleGroupMappings)) {
        if (await isUserInGroup(groupId, user.accessToken)) {
            roles.push(role);
        }
    }
    console.log("[dilin-debug] roles:" + roles);

    context.res.json({
        roles
    });
}

async function isUserInGroup(groupId, bearerToken) {
    console.log("[dilin-debug] ### Calling isUserInGroup() ###");
    console.log("[dilin-debug] groupId:" + groupId);
    const url = new URL('https://graph.microsoft.com/v1.0/me/memberOf');
    url.searchParams.append('$filter', `id eq '${groupId}'`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}
